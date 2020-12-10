import { ColorResolvable, MessageEmbed } from "discord.js";
import { HelpCommandCotext, HelpEntry } from "presentation_core";
import {
  createCategoryFields,
  buildCategoryDescription,
} from "presentation_core";
import { createEmbedWithMetaData } from "protocol_util-djs";
const categoryDesc = "辞書に関するコマンド";
export function categoryWordsEmbed(
  color: ColorResolvable,
  value: Map<string, HelpEntry>
): (ctx: HelpCommandCotext) => MessageEmbed {
  return (ctx: HelpCommandCotext): MessageEmbed => {
    const r = createEmbedWithMetaData({ color, ...ctx.executor });
    const fields = createCategoryFields("ja_JP", value, ctx);
    r.setTitle("Configurate");
    r.setDescription(categoryDesc);
    r.addFields(fields);
    return r;
  };
}
export function categoryWordsDescription(
  value: Map<string, HelpEntry>
): (ctx: HelpCommandCotext) => string {
  return (): string => {
    return categoryDesc + "\n" + buildCategoryDescription(value);
  };
}
