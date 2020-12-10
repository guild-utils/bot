import { ColorResolvable } from "discord.js";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { MainDictionaryCommandResponses } from "../../commands-v2/main-dictionary";
import { codeblock, paginationEmbeds } from "./dictionary-common";

export function mainDictionaryLang(
  color: ColorResolvable
): MainDictionaryCommandResponses {
  return {
    addWordSuccessWithCreate: (exec, c) =>
      createEmbedWithMetaData({
        color,
        ...exec,
      })
        .setTitle("成功")
        .setDescription("変換を作成しました。")
        .addField(
          "詳細",
          ["from", codeblock("", c.from), "to", codeblock("", c.to)].join("\n")
        ),
    addWordSuccessWithOverwrite: (exec, b, c) =>
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
    deleteWordSuccesWithDelete: (exec, from, to) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("成功")
        .setDescription("変換を削除しました。")
        .addField(
          "詳細",
          ["from", codeblock("", from), "to", codeblock("", to)].join("\n")
        ),
    deleteWordSuccesWithNone: (exec, from) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("成功")
        .setDescription("変換は存在しませんでした。")
        .addField("詳細", ["from", codeblock("", from)].join("\n")),
    invalidRemoveFormat: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription(
          "第二引数は不要です。「mdic remove 削除したい単語」のように使用してください。"
        ),
    requireKey: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription("第一引数は必須です。"),
    ...paginationEmbeds("メイン辞書", color),
  };
}
