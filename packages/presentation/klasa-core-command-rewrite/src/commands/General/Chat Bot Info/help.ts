/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommandStore, KlasaMessage, Language } from "klasa";
import { CommandEx } from "../../../commandEx";
import { MessageEmbed } from "discord.js";
import {
  ReturnType,
  CategorizedCommands,
  categorizeCommand,
} from "../../../arguments/category";
import { Command } from "klasa";
export default class extends CommandEx {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory);

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
    if (
      msg.guild &&
      !msg.guild.me?.permissionsIn(msg.channel).has("EMBED_LINKS")
    ) {
      return msg.sendLocale("PLEASE_ALLOW_TO_SEND_EMBED_LINKS");
    }
    if (!cmd) {
      const embed = new MessageEmbed()
        .setTitle("Help")
        .setDescription(
          msg.language.get(
            "COMMAND_HELP_SIMPLE_EMBED_DESC",
            msg.guild?.settings.get("prefix") ?? this.client.options.prefix
          )
        )
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
        .setFooter(
          msg.language.get(
            "COMMAND_HELP_ALL_FOOTER",
            msg.guild?.settings.get("prefix") ?? this.client.options.prefix
          )
        );
      await setCommonConf(embed, msg);
      return msg.sendEmbed(embed);
    }
    if (cmd instanceof Command) {
      const embed = buildEmbedWithCmd(cmd, msg);
      await setCommonConf(embed, msg);
      return msg.sendEmbed(embed);
    }
    // eslint-disable-next-line no-prototype-builtins
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
        .setFooter(
          msg.language.get(
            "COMMAND_HELP_SUB_CATEGORY_FOOTER",
            msg.guildSettings?.get("prefix") ?? this.client.options.prefix
          )
        );
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
      .setFooter(
        msg.language.get(
          "COMMAND_HELP_CATEGORY_FOOTER",
          msg.guildSettings.get("prefix") ?? this.client.options.prefix
        )
      );
    await setCommonConf(embed, msg);
    return msg.sendEmbed(embed);
  }
  categorizeCommand(): CategorizedCommands {
    return categorizeCommand(this.client.commands);
  }
}
function setCommonConf(embed: MessageEmbed, msg: KlasaMessage): Promise<void> {
  embed.setColor(msg.client.options.themeColor);
  return Promise.resolve();
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
    const resolved = resolveFunctionOrString(cmd.description, msg);
    if (resolved) {
      embed.setDescription(resolved);
    }
  }
  if (cmd.usage) {
    embed.addField("Usage", cmd.usage.fullUsage(msg));
  }
  if (cmd.extendedHelp) {
    const resolved = resolveFunctionOrString(cmd.extendedHelp, msg);
    if (resolved) {
      embed.addField("More Info", resolved);
    }
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
