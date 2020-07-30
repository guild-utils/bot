import { Command, CommandStore, KlasaMessage, Language } from "klasa";
import { MessageEmbed } from "discord.js";
import {
  ReturnType,
  CategorizedCommands,
  categorizeCommand,
} from "../../../arguments/category";
export default class extends Command {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory, {
      aliases: ["h", "commands", "command", "categorys", "category"],
      guarded: true,
      description: (language) => language.get("COMMAND_HELP_DESCRIPTION"),
      extendedHelp: (language) => language.get("COMMAND_HELP_EXTENDED_MESSAGE"),
      usage: "(Command:command|Category:category)",
    });

    this.createCustomResolver("command", (arg, possible, message) => {
      if (!arg) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.client.arguments.get("command").run(arg, possible, message);
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async run(
    msg: KlasaMessage,
    [cmd]: [ReturnType | Command | undefined]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const me = await msg.guild?.members.fetch(this.client.user!);
    if (!me!.permissionsIn(msg.channel).has("EMBED_LINKS")) {
      return msg.sendLocale("PLEASE_ALLOW_TO_SEND_EMBED_LINKS");
    }
    if (!cmd) {
      const embed = new MessageEmbed()
        .setTitle("Help")
        .setDescription(msg.language.get("COMMAND_HELP_SIMPLE_EMBED_DESC", msg))
        .addFields(
          Object.values(this.categorizeCommand().category).map((e) => {
            return {
              name: e!.name,
              value: [
                ...Object.values(e!.subCategory).map(
                  (e) => `__\`\`${e!.name}\`\`__`
                ),
                ...e!.direct.map((e) => e.name).map((e) => `\`\`${e}\`\``),
              ].join(" "),
            };
          })
        )
        .addFields(
          this.categorizeCommand().direct.map((e) => {
            return {
              name: e.name,
              value: resolveFunctionOrString(e.description, msg),
            };
          })
        )
        .setFooter(msg.language.get("COMMAND_HELP_ALL_FOOTER", msg));
      await setCommonConf(embed, msg);
      return msg.sendEmbed(embed);
    }
    if (cmd instanceof Command) {
      const embed = buildEmbedWithCmd(cmd, msg);
      await setCommonConf(embed, msg);
      return msg.sendEmbed(embed);
    }
    if (!cmd.hasOwnProperty("subCategory")) {
      const cmd_ = cmd as NonNullable<
        NonNullable<
          CategorizedCommands["category"][string]
        >["subCategory"][string]
      >;
      const embed = new MessageEmbed()
        .setTitle(cmd_.categoryName + "/" + cmd_.name)
        .addFields(
          cmd_.command.map((e) => {
            return {
              name: e.name,
              value: resolveFunctionOrString(e.description, msg),
            };
          })
        )
        .setFooter(msg.language.get("COMMAND_HELP_SUB_CATEGORY_FOOTER", msg));
      await setCommonConf(embed, msg);
      return msg.sendEmbed(embed);
    }
    const embed = new MessageEmbed()
      .setTitle(
        (cmd as NonNullable<CategorizedCommands["category"][string]>).name
      )
      .addFields(
        Object.values(
          (cmd as NonNullable<CategorizedCommands["category"][string]>)
            .subCategory
        ).map((v) => {
          return {
            name: v!.name,
            value: v!.command
              .map((e) => e.name)
              .map((e) => `\`\`${e}\`\``)
              .join(" "),
          };
        })
      )
      .addFields(
        (cmd as NonNullable<
          CategorizedCommands["category"][string]
        >).direct.map((e) => {
          return {
            name: e.name,
            value: resolveFunctionOrString(e.description, msg),
          };
        })
      )
      .setFooter(msg.language.get("COMMAND_HELP_CATEGORY_FOOTER", msg));
    await setCommonConf(embed, msg);
    return msg.sendEmbed(embed);
  }
  categorizeCommand(): CategorizedCommands {
    return categorizeCommand(this.client.commands);
  }
}
async function setCommonConf(
  embed: MessageEmbed,
  msg: KlasaMessage
): Promise<void> {
  embed.setColor(msg.client.options.themeColor);
}

function resolveFunctionOrString(
  x: ((lang: Language) => string) | string,
  msg: KlasaMessage
) {
  return typeof x === "string" ? x : x(msg.language);
}

function buildEmbedWithCmd(cmd: Command, msg: KlasaMessage): MessageEmbed {
  const embed = new MessageEmbed();
  if (cmd.name) {
    embed.setTitle(
      cmd.name + (cmd.aliases.length ? `(${cmd.aliases.join(",")})` : "")
    );
  }
  if (cmd.description) {
    embed.setDescription(resolveFunctionOrString(cmd.description, msg));
  }
  if (cmd.usage) {
    embed.addField("Usage", cmd.usage.fullUsage(msg));
  }
  if (cmd.extendedHelp) {
    embed.addField("More Info", resolveFunctionOrString(cmd.extendedHelp, msg));
  }
  if (cmd.category) {
    embed.addField("Category", cmd.category, true);
  }
  if (cmd.subCategory) {
    embed.addField("Sub Category", cmd.subCategory, true);
  }
  if (cmd.cooldown) {
    embed.addField("Cooldown", cmd.cooldown, true);
  }

  return embed;
}
