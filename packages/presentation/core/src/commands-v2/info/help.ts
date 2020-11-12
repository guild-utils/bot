import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { CommandSchema } from "@guild-utils/command-schema";
import { Message, MessageEmbed } from "discord.js";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { getLangType } from "../../util/get-lang";
export type HelpEntry = Category | Command | DeepEntry | Documentation;
export type HelpCommandCotext = {
  runningCommand: string[];
  key: string[] | undefined;
  prefix: string | undefined;
  executor: Executor;
};

export interface Category {
  type: "category";
  name: (lang: string) => string;
  embed: (lang: string) => (ctx: HelpCommandCotext) => MessageEmbed;
  summary: (lang: string) => (ctx: HelpCommandCotext) => string;
  resolverValue: Map<string, HelpEntry>;
}
export interface Command {
  type: "command";
  embed: (lang: string) => (ctx: HelpCommandCotext) => MessageEmbed;
  summary: (lang: string) => (ctx: HelpCommandCotext) => string;
  resolveSubCommand: (key: string) => Command | undefined;
  value: CommandSchema;
}
export interface DeepEntry {
  type: "deep";
  visual: "command" | "category" | "documentation";
  more: (key?: string) => HelpEntry | undefined;
  summary: (lang: string) => (ctx: HelpCommandCotext) => string;
}
export interface Documentation {
  type: "documentation";
  embed: (lang: string) => (ctx: HelpCommandCotext) => MessageEmbed;
  summary: (lang: string) => (ctx: HelpCommandCotext) => string;
}
export type CommandHelpTexts = {
  entryNotFound: (ctx: HelpCommandCotext) => MessageEmbed;
};
export class CommandHelp implements CommandBase {
  constructor(
    private readonly responses: (lang: string) => CommandHelpTexts,
    private readonly root: Category,
    private readonly flatten: Map<string, HelpEntry>,
    private readonly getLang: getLangType
  ) {}
  async run(
    msg: Message,
    [akey]: [string[]],
    opt: never,
    cctx: CommandContext
  ): Promise<void> {
    const lang = await this.getLang(msg.guild?.id);
    const key = typeof akey === "string" ? [akey] : akey;
    const responses = this.responses(lang);
    const hctx: HelpCommandCotext = {
      key,
      executor: executorFromMessage(msg),
      ...cctx,
    };
    if (key == null || key.length === 0) {
      await msg.channel.send(this.root.embed(lang)(hctx));
      return;
    }
    const cmdOrCategory =
      this.flatten.get(key[0]) ?? this.flatten.get(key[0].toLowerCase());

    await processEntry(cmdOrCategory, 1, key);
    async function processEntry(
      processingEntry: HelpEntry | undefined,
      processingKeyIndex: number,
      key: string[]
    ) {
      if (processingEntry == undefined) {
        await msg.channel.send(responses.entryNotFound(hctx));
        return;
      }
      switch (processingEntry.type) {
        case "category": {
          const v = key[processingKeyIndex];
          if (v == null) {
            await msg.channel.send(processingEntry.embed(lang)(hctx));
          } else {
            await processEntry(
              processingEntry.resolverValue.get(v) ??
                processingEntry.resolverValue.get(v.toLowerCase()),
              processingKeyIndex + 1,
              key
            );
          }
          return;
        }
        case "deep": {
          const nk = key[processingKeyIndex];
          await processEntry(
            processingEntry.more(nk) ?? processingEntry.more(nk.toLowerCase()),
            processingKeyIndex + 1,
            key
          );
          return;
        }
        case "command": {
          const nk = key[processingKeyIndex + 1];
          const resolved = nk
            ? processingEntry.resolveSubCommand(nk)
            : undefined;
          if (resolved) {
            await processEntry(resolved, processingKeyIndex + 1, key);
            return;
          }
          await msg.channel.send(processingEntry.embed(lang)(hctx));
          return;
        }

        case "documentation":
          await msg.channel.send(processingEntry.embed(lang)(hctx));
          return;
      }
    }
  }
}
