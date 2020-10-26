import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { MainParserContext } from "@guild-utils/command-parser";
import { CommandSchema, RateLimitScope } from "@guild-utils/command-schema";
import { Client, Message, MessageEmbed } from "discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { MonitorBase } from "monitor-discord.js";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { ResetTime } from "rate-limit";
import { getLangType } from "../../util/get-lang";
import { RateLimitEntrys, RateLimitLangDescription } from "./rateLimit";
async function checkSchema(
  schema: CommandSchema,
  repo: BasicBotConfigRepository,
  guild: string | undefined
): Promise<boolean> {
  if (guild) {
    const disabledCommands = await repo.getDisabledCommands(guild);
    if (disabledCommands.has(schema.name)) {
      return false;
    }
  }
  return true;
}
async function checkRateLimit(
  message: Message,
  limitsRaw: RateLimitEntrys | undefined
): Promise<[RateLimitLangDescription, number] | undefined> {
  const limits = limitsRaw ?? [];
  const m: Record<RateLimitScope, unknown> = {
    channel: message.channel.id,
    guild: message.guild?.id ?? message.channel.id,
    member: (message.guild?.id ?? message.channel.id) + "." + message.author.id,
    user: message.author.id,
  };
  const r = await Promise.all(
    limits.map(
      async ([scp, lang, mgr]): Promise<
        [RateLimitLangDescription, [boolean, number]]
      > => {
        return [lang, await mgr.consume(m[scp])];
      }
    )
  );
  const fr = r.filter(([, [e]]) => !e);
  if (fr.length === 0) {
    return undefined;
  }
  return fr
    .map(([lang, [, rt]]): [RateLimitLangDescription, ResetTime] => [lang, rt])
    .reduce((a, e) => {
      return a[1] > e[1] ? a : e;
    });
}
export type CommandHandlerResponses = {
  commandDisabled: (
    name: string,
    prefix: string,
    exec: Executor
  ) => MessageEmbed;
  internalError: (error: Error, exec: Executor) => MessageEmbed;
};
export type CommandResolver = (
  k: string
) =>
  | [CommandBase, CommandSchema | undefined, RateLimitEntrys | undefined]
  | undefined;
export default class extends MonitorBase {
  constructor(
    private readonly parser: (
      content: string,
      ctx: MainParserContext
    ) => Promise<
      [string, unknown[], Record<string, unknown>, CommandContext] | undefined
    >,
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
  }
  private mentionPrefix?: RegExp;
  async run(message: Message): Promise<void> {
    if (!this.mentionPrefix) {
      return;
    }
    let r:
      | [string, unknown[], Record<string, unknown>, CommandContext]
      | undefined;
    try {
      r = await this.parser(message.content, {
        guild: message.guild?.id,
        user: message.author.id,
        prefix: message.guild?.id
          ? (await this.repo.getPrefix(message.guild.id)) ?? this.prefix
          : this.prefix,
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
    const [rk, pos, opt, ctx] = r;
    const resolved = this.commandResolver(rk);
    if (!resolved) {
      return;
    }
    const [impl, schema, rateLimits] = resolved;
    if (schema) {
      if (!(await checkSchema(schema, this.repo, message.guild?.id))) {
        await message.channel.send(
          this.responses(await this.getLang(message.guild?.id)).commandDisabled(
            schema.name,
            ctx.prefix,
            {
              user: message.author,
              member: message.member,
            }
          )
        );
        return;
      }
    }
    try {
      const crl = await checkRateLimit(message, rateLimits);
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
          this.responses(await this.getLang(message.guild?.id)).internalError(
            e,
            executorFromMessage(message)
          )
        );
      }
    }
  }
  init(client: Client): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.mentionPrefix = new RegExp(`^<@!?${client.user!.id}>`);
  }
}
