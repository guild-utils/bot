/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommandStore, KlasaMessage, Language } from "klasa";
import { CommandEx } from "../../commandEx";
import { MessageEmbed } from "discord.js";
import {
  ReturnType,
  CategorizedCommands,
  categorizeCommand,
} from "../../arguments/category";
import { Command } from "klasa";
import { CommandData } from "domain_command-data";

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
      const prefix = msg.guild?.id
        ? msg.client.options.guildConfigRepository.getPrefix(msg.guild.id)
        : this.client.options.prefix;
      const embed = new MessageEmbed()
        .setTitle("Help")
        .setDescription(
          msg.language.get("COMMAND_HELP_SIMPLE_EMBED_DESC", prefix)
        )
        .addFields(
          Object.values(this.categorizeCommand(msg.language.name).category).map(
            (e) => {
              return {
                name: e!.name,
                value: [
                  ...Object.values(e!.subCategory).map(
                    (e) => `__\`\`${e!.name}\`\`__`
                  ),
                  ...e!.direct.map((e) => e.name).map((e) => `\`\`${e}\`\``),
                ].join(" "),
              };
            }
          )
        )
        .addFields(
          this.categorizeCommand(msg.language.name).direct.map((e) => {
            return {
              name: e.name,
              value: resolveFunctionOrString(
                e.description ?? msg.language.get("NO_DESCRIPTION_PROVIDED"),
                msg
              ),
            };
          })
        )
        .setFooter(msg.language.get("COMMAND_HELP_ALL_FOOTER", prefix));
      await setCommonConf(embed, msg);
      return msg.sendEmbed(embed);
    }
    if (cmd instanceof CommandEx) {
      const cmddata = this.client.options.allCommands[msg.language.name]?.find(
        (e) => e.name === cmd.name
      );
      const embed = buildEmbedWithCmd(cmddata ?? cmd.metadata, msg);
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
              value: resolveFunctionOrString(
                e.description ?? msg.language.get("NO_DESCRIPTION_PROVIDED"),
                msg
              ),
            };
          })
        )
        .setFooter(
          msg.language.get(
            "COMMAND_HELP_SUB_CATEGORY_FOOTER",
            msg.guild?.id
              ? this.client.options.guildConfigRepository.getPrefix(
                  msg.guild.id
                )
              : this.client.options.prefix
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
            value: resolveFunctionOrString(
              e.description ?? msg.language.get("NO_DESCRIPTION_PROVIDED"),
              msg
            ),
          };
        })
      )
      .setFooter(
        msg.language.get(
          "COMMAND_HELP_CATEGORY_FOOTER",
          msg.guild?.id
            ? this.client.options.guildConfigRepository.getPrefix(msg.guild.id)
            : this.client.options.prefix
        )
      );
    await setCommonConf(embed, msg);
    return msg.sendEmbed(embed);
  }
  categorizeCommand(lang: string): CategorizedCommands {
    return categorizeCommand(lang, this.client.options.allCommands[lang]);
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

function buildEmbedWithCmd(cmd: CommandData, msg: KlasaMessage): MessageEmbed {
  const embed = new MessageEmbed();
  const aliases = cmd.aliases ?? [];
  if (cmd.name) {
    embed.setTitle(cmd.name + (aliases.length ? `(${aliases.join(",")})` : ""));
  }
  if (cmd.description) {
    const resolved = resolveFunctionOrString(cmd.description, msg);
    if (resolved) {
      embed.setDescription(resolved);
    }
  }
  if (cmd.usage) {
    embed.addField(
      "Usage",
      buildUsage(msg, [cmd.name, ...aliases], cmd.usage, cmd.usageDelim)
    );
  }
  if (cmd.more) {
    const resolved = resolveFunctionOrString(cmd.more, msg);
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
function buildUsage(
  message: KlasaMessage,
  names: string[],
  usageString: string,
  usageDelim: string | undefined
) {
  const commands = names.length === 1 ? names[0] : `《${names.join("|")}》`;
  const deliminatedUsage =
    usageString !== "" ? ` ${usageString.split(" ").join(usageDelim)}` : "";
  const nearlyFullUsage = `${commands}${deliminatedUsage}`;
  let prefix = message.prefixLength
    ? message.content.slice(0, message.prefixLength)
    : message.guild?.id
    ? message.client.options.guildConfigRepository.getPrefix(message.guild.id)
    : message.client.options.prefix;
  if (message.prefix === message.client.mentionPrefix) {
    prefix = `@${message.client.user!.tag}`;
  } else if (Array.isArray(prefix)) {
    [prefix] = prefix;
  }
  return `${prefix.length !== 1 ? `${prefix} ` : prefix}${nearlyFullUsage}`;
}
