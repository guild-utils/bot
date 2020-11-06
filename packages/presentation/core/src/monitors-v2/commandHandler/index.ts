import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { MainParserContext, SpecialInfo } from "@guild-utils/command-parser";
import { CommandSchema, RateLimitEntry } from "@guild-utils/command-schema";
import { Client, Message, MessageEmbed } from "discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { MonitorBase } from "monitor-discord.js";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { getLangType } from "../../util/get-lang";
import { checkRateLimit, checkSchema } from "../../util/command-processor";
import { createRateLimitEntrys, RateLimitEntrys } from "../../util/rate-limit";
import { ResetTime } from "rate-limit";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PromiseReturnType<F extends (...args: any[]) => any> = ReturnType<
  F
> extends Promise<infer T>
  ? T
  : never;
export type CommandHandlerResponses = {
  commandDisabled: (
    name: string,
    prefix: string,
    exec: Executor
  ) => MessageEmbed;
  internalError: (error: Error, exec: Executor) => MessageEmbed;
  remindPrefix: (prefix: string, exec: Executor) => MessageEmbed;
  globalRateLimitReached: (
    e: RateLimitEntry,
    rt: ResetTime,
    message: Message
  ) => MessageEmbed;
};
export type CommandResolver = (
  k: string
) =>
  | [CommandBase, CommandSchema | undefined, RateLimitEntrys | undefined]
  | undefined;
export type ParserType = (
  content: string,
  ctx: MainParserContext
) => Promise<
  | [
      string,
      unknown[],
      Record<string, unknown>,
      CommandContext,
      SpecialInfo | undefined
    ]
  | undefined
>;
export default class extends MonitorBase {
  private readonly globalRateLimits: RateLimitEntrys;
  constructor(
    private readonly parser: ParserType,
    private readonly commandResolver: CommandResolver,
    private readonly repo: BasicBotConfigRepository,
    private readonly responses: (lang: string) => CommandHandlerResponses,
    private readonly prefix: string,
    private readonly getLang: getLangType
  ) {
    super({
      ignoreBots: true,
      ignoreSelf: true,
      ignoreOthers: false,
      ignoreWebhooks: true,
      ignoreEdits: true,
    });
    const x: RateLimitEntry[] = [
      ["user", 3, 1 * 1000],
      ["user", 30, 30 * 1000],
      ["guild", 50, 1000],
    ];
    this.globalRateLimits = createRateLimitEntrys(
      new Set(x),
      (lang) => responses(lang).globalRateLimitReached
    );
  }
  private mentionPrefix?: RegExp;
  async run(message: Message): Promise<void> {
    const res = async () =>
      this.responses(await this.getLang(message.guild?.id));
    if (!this.mentionPrefix) {
      return;
    }
    const parser = this.parser;
    let r: PromiseReturnType<typeof parser>;
    const prefix = message.guild?.id
      ? (await this.repo.getPrefix(message.guild.id)) ?? this.prefix
      : this.prefix;
    try {
      r = await parser(message.content, {
        guild: message.guild?.id,
        user: message.author.id,
        prefix,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        mentionPrefix: this.mentionPrefix,
        channelType: message.channel.type,
      });
    } catch (e) {
      console.error(e);
      return;
    }
    if (!r) {
      return;
    }
    console.log(r);
    const [rk, pos, opt, ctx, si] = r;
    if (si?.isDefault && this.mentionPrefix.test(ctx.prefix)) {
      await message.channel.send(
        (await res()).remindPrefix(prefix, executorFromMessage(message))
      );
      return;
    }
    const resolved = this.commandResolver(rk);
    if (!resolved) {
      return;
    }
    const [impl, schema, rateLimits] = resolved;
    if (schema) {
      if (!(await checkSchema(schema, this.repo, message.guild?.id))) {
        await message.channel.send(
          (await res()).commandDisabled(schema.name, ctx.prefix, {
            user: message.author,
            member: message.member,
          })
        );
        return;
      }
    }
    try {
      const crl = await checkRateLimit(message, [
        ...(rateLimits ?? []),
        ...this.globalRateLimits,
      ]);
      if (crl != undefined) {
        const [desc, rt] = crl;
        await message.channel.send(
          desc(await this.getLang(message.guild?.id))(rt, message)
        );
        return;
      }
      await impl.run(message, pos, opt, ctx);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
        await message.channel.send(
          (await res()).internalError(e, executorFromMessage(message))
        );
      }
    }
  }
  init(client: Client): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.mentionPrefix = new RegExp(`^<@!?${client.user!.id}>`);
  }
}
