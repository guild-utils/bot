import { ColorResolvable } from "discord.js";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { CreateViewResponses } from "../../gui/pagination";

export const dictionaryViewMessages = {
  empty: "現在辞書にはなにも登録されていません。",
  help: [
    "リアクションまたは対応したテキストを送信することで操作が可能です。",
    "何も操作がないまま1分経過すると自動的に終了されます。",
    "",
    "\u23ea **<<** **f**",
    "先頭へ",
    "\u25c0 **<** **b**",
    "前へ",
    "\u23f9 **q**",
    "閉じる",
    "\u25b6 **>** **n**",
    "次へ",
    "\u23e9 **>>** **l**",
    "最後へ",
    "\u2753 **?** **h**",
    "ヘルプ",
    "",
    "もう一度?を押すか、その他の操作をすることでヘルプを閉じることができます。",
  ].join("\n"),
} as const;
export function codeblock(l: string, v: string): string {
  return `\`\`\`${l}\n${v}\n\`\`\``;
}
export function paginationEmbeds(
  title: string,
  color: ColorResolvable
): CreateViewResponses {
  return {
    createBaseEmbed: (exec, index, maxIndex) =>
      createEmbedWithMetaData({ ...exec, color }).setTitle(
        `${title}(${index + 1}/${maxIndex})`
      ),
    createEmptyEmbed: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle(`${title}(0/0)`)
        .setDescription(dictionaryViewMessages.empty),
    createHelpEmbed: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle(`${title}(ヘルプ)`)
        .setDescription(dictionaryViewMessages.help),
  };
}
