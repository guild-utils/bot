import { ColorResolvable, MessageEmbed } from "discord.js";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { createCategoryFields } from "../util";
import { HelpCommandCotext, HelpEntry } from "../../commands-v2/info/help";
export {
  rtlInvite,
  rtlPing,
  statsEmbed,
  rtlHelp,
  rtlInfo,
  categoryInfoEmbed,
  categoryInfoDescription,
} from "./info";
export {
  categoryConfigurateDescription,
  categoryConfigurateEmbed,
  rtlUpdate,
} from "./configurate";
export { categoryVoiceDescription, categoryVoiceEmbed } from "./voice";
export function categoryRootEmbed(
  color: ColorResolvable,
  value: Map<string, HelpEntry>
): (ctx: HelpCommandCotext) => MessageEmbed {
  return (ctx: HelpCommandCotext) => {
    const r = createEmbedWithMetaData({ color, ...ctx.executor });
    const fields = createCategoryFields("ja_JP", value, ctx);
    r.setTitle("ヘルプ");
    r.setDescription(`${ctx.prefix ?? ""}${ctx.runningCommand[0]} ${
      ctx.runningCommand[0]
    }を実行するとhelpコマンドのより詳細な使い方が確認できます。
    質問や意見、バグ見つけた!動かない!などあれば[サポートサーバー](https://discord.gg/xxkzCHU)まで。`);
    r.addFields(fields);
    return r;
  };
}
export function categoryRootDescription(): (ctx: HelpCommandCotext) => string {
  return () => "";
}
