import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { MainParserContext } from "@guild-utils/command-parser";
import { CommandSchema } from "@guild-utils/command-schema";
import { Client, Message, MessageEmbed } from "discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { MonitorBase } from "monitor-discord.js";
import { Executor } from "protocol_util-djs";
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
    private readonly prefix: string
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
    const r = await this.parser(message.content, {
      guild: message.guild?.id,
      user: message.author.id,
      prefix: message.guild?.id
        ? (await this.repo.getPrefix(message.guild.id)) ?? this.prefix
        : this.prefix,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mentionPrefix: this.mentionPrefix,
      channelType: message.channel.type,
    });
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
          await message.sendEmbed(
            this.responses(
              message.guild
                ? (await this.repo.getLanguage(message.guild.id)) ?? "ja_JP"
                : "ja_JP"
            ).commandDisabled(schema.name, ctx.prefix, {
              user: message.author,
              member: message.member,
            })
          );
          return;
      }
    }
    await impl.run(message, pos, opt, ctx);
  }
  init(client: Client): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.mentionPrefix = new RegExp(`^<@!?${client.user!.id}>`);
  }
}
