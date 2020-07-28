import { Command, CommandStore, KlasaMessage, Language } from "klasa";
import { MessageEmbed } from "discord.js";
import {
  ReturnType,
  CategorizedCommands,
  categorizeCommand,
} from "../../../arguments/category";
// eslint-disable-next-line @typescript-eslint/unbound-method
export default class extends Command {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory, {
      aliases: ["commands"],
      guarded: true,
      requiredPermissions: ["EMBED_LINKS"],
      description: (language) => language.get("COMMAND_HELP_DESCRIPTION"),
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
    if (!cmd) {
      const embed = new MessageEmbed()
        .setTitle("Categorys")
        .setFooter(
          msg.member?.nickname ?? msg.author.username,
          msg.author.avatarURL() ?? undefined
        )
        .addFields(
          Object.values(this.categorizeCommand()).map((e) => {
            return {
              name: e.name,
              value: [
                ...Object.values(e.subCategory).map(e=>`__\`\`${e.name}\`\`__`),
                ...e.direct.map((e) => e.name).map(e=>`\`\`${e}\`\``),
              ].join(" "),
            };
          })
        );
      setCommonConf(embed, msg);
      return msg.sendEmbed(embed);
    }
    if (cmd instanceof Command) {
      const embed = buildEmbedWithCmd(cmd, msg);
      setCommonConf(embed, msg);
      return msg.sendEmbed(embed);
    }
    if (!cmd.hasOwnProperty("subCategory")) {
      const cmd_  =(cmd as CategorizedCommands[string]["subCategory"][string]);
      const embed = new MessageEmbed().setTitle(cmd_.categoryName+"/"+cmd_.name).addFields(
        cmd_.command.map(
          (e) => {
            return {
              name: e.name,
              value: resolveFunctionOrString(e.description, msg),
            };
          }
        )
      );
      setCommonConf(embed, msg);
      return msg.sendEmbed(embed);
    }
    const embed = new MessageEmbed()
      .setTitle((cmd as CategorizedCommands[string]).name)
      .addFields(
        Object.values((cmd as CategorizedCommands[string]).subCategory).map(
          (v) => {
            return {
              name: v.name,
              value: v.command.map((e) => e.name).map(e=>`\`\`${e}\`\``).join(" "),
            };
          }
        )
      )
      .addFields(
        (cmd as CategorizedCommands[string]).direct.map((e) => {
          return {
            name: e.name,
            value: resolveFunctionOrString(e.description, msg),
          };
        })
      );
    setCommonConf(embed, msg);
    return msg.sendEmbed(embed);
  }
  categorizeCommand(): CategorizedCommands {
    return categorizeCommand(this.client.commands);
  }
}
function setCommonConf(embed: MessageEmbed, msg: KlasaMessage): void {
  embed.setFooter(
    msg.member?.nickname ?? msg.author.username,
    msg.author.avatarURL() ?? undefined
  );
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
      (cmd.category ? `${cmd.category}/` : "") +
        (cmd.subCategory ? `${cmd.subCategory}/` : "") +
        cmd.name +
        (cmd.aliases.length ? `(${cmd.aliases.join(",")})` : "")
    );
  }
  if (cmd.description) {
    embed.setDescription(resolveFunctionOrString(cmd.description, msg));
  }
  if (cmd.usage) {
    embed.addField("usage", cmd.usage.fullUsage(msg));
  }
  if (cmd.extendedHelp) {
    embed.addField("more info", resolveFunctionOrString(cmd.extendedHelp, msg));
  }
  if (cmd.category) {
    embed.addField("category", cmd.category, true);
  }
  if (cmd.subCategory) {
    embed.addField("sub category", cmd.subCategory, true);
  }
  if (cmd.cooldown) {
    embed.addField("cooldown", cmd.cooldown, true);
  }

  return embed;
}
