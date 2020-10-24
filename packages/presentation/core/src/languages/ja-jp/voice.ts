import { ColorResolvable, MessageEmbed } from "discord.js";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { HelpCommandCotext, HelpEntry } from "../../commands-v2/info/help";
import { buildCategoryDescription, createCategoryFields } from "../util";
const categoryDesc = "読み上げに関するコマンド";
export function categoryVoiceEmbed(
  color: ColorResolvable,
  visualValue: Map<string, HelpEntry>
): (ctx: HelpCommandCotext) => MessageEmbed {
  return (ctx) =>
    createEmbedWithMetaData({ color, ...ctx.executor })
      .setTitle("Voice")
      .setDescription(categoryDesc)
      .addFields(createCategoryFields("ja_JP", visualValue, ctx));
}
export function categoryVoiceDescription(
  visualValue: Map<string, HelpEntry>
): (ctx: HelpCommandCotext) => string {
  return () => categoryDesc + "\n" + buildCategoryDescription(visualValue);
}
