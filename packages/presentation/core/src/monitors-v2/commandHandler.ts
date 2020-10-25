import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { MainParserContext } from "@guild-utils/command-parser";
import { CommandSchema } from "@guild-utils/command-schema";
import { Client, Message, MessageEmbed } from "discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { MonitorBase } from "monitor-discord.js";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { getLangType } from "../util/get-lang";
async function checkSchema(
  schema: CommandSchema,
  repo: BasicBotConfigRepository,
  guild: string | undefined
): Promise<"ok" | "commandDisabled"> {
  if (guild) {
    const disabledCommands = await repo.getDisabledCommands(guild);
    if (disabledCommands.has(schema.name)) {
      return "commandDisabled";
    }
  }
  return "ok";
}
export type CommandHandlerResponses = {
  commandDisabled: (
    name: string,
    prefix: string,
    exec: Executor
  ) => MessageEmbed;
  internalError: (error: Error, exec: Executor) => MessageEmbed;
};
export default class extends MonitorBase {
  constructor(
    private readonly parser: (
      content: string,
      ctx: MainParserContext
    ) => Promise<
      [string, unknown[], Record<string, unknown>, CommandContext] | undefined
    >,
    private readonly commandResolver: (
      k: string
    ) => [CommandBase, CommandSchema | undefined] | undefined,
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
    const [impl, schema] = resolved;
    if (schema) {
      switch (await checkSchema(schema, this.repo, message.guild?.id)) {
        case "ok":
          break;
        case "commandDisabled":
          await message.channel.send(
            this.responses(
              await this.getLang(message.guild?.id)
            ).commandDisabled(schema.name, ctx.prefix, {
              user: message.author,
              member: message.member,
            })
          );
          return;
      }
    }
    try {
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
