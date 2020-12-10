import { ColorResolvable } from "discord.js";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { SimpleDictionaryCommandResponses } from "../../commands/simple-dictionary";
import { codeblock, paginationEmbeds } from "./dictionary-common";

export function simpleDictionaryLang(
  color: ColorResolvable,
  title: string
): SimpleDictionaryCommandResponses {
  const abCommonLang: SimpleDictionaryCommandResponses = {
    addSuccess: (exec, cur) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("成功")
        .setDescription("変換を追加しました。")
        .addField(
          "詳細",
          ["from", codeblock("", cur.from), "to", codeblock("", cur.to)].join(
            "\n"
          )
        ),
    deleteSuccess: (exec, cur) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("成功")
        .setDescription("変換を削除しました。")
        .addField(
          "詳細",
          ["from", codeblock("", cur.from), "to", codeblock("", cur.to)].join(
            "\n"
          )
        ),
    invalidAddFormat: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription(
          [
            "入力を適切に解釈できませんでした。",
            "「数字 変換前の単語,変換後の単語」あるいは、「変換後の単語」のように使用してください。",
          ].join("\n")
        ),
    invalidIndexRange: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription("その番号のエントリーは存在しません。"),
    invalidRemoveFormat: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription(
          "第二引数は不要です。また第一引数には必ず削除したいエントリーの番号を指定する必要があります。"
        ),
    invalidUpdateFormat: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription(
          "第一引数には必ず更新したいエントリーの番号を指定する必要があります。"
        ),
    updateSuccess: (exec, b, c) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("成功")
        .setDescription("変換を更新しました。")
        .addField(
          "現在の値",
          ["from", codeblock("", c.from), "to", codeblock("", c.to)].join("\n")
        )
        .addField(
          "過去の値",
          ["from", codeblock("", b.from), "to", codeblock("", b.to)].join("\n")
        ),
    ...paginationEmbeds(title, color),
  };
  return abCommonLang;
}
