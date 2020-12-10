import { ColorResolvable, Guild, MessageEmbed } from "discord.js";
import { ConfigurateUsecaseResultTypeSingle } from "protocol_configurate-usecase";
import {
  createEmbedWithMetaData,
  CreateEmbedWithMetaDataOpt,
  Executor,
} from "protocol_util-djs";
import { UpdateResultResponses } from "../../commands-v2/configurate/util";
import { HelpEntry, HelpCommandCotext } from "../../commands-v2/info/help";
import {
  NotAllowedError,
  SenderPermissionError,
} from "../../errors/permission-error";
import { buildCategoryDescription, createCategoryFields } from "../util";
const categoryDesc = "設定に関するコマンド";
export function categoryConfigurateEmbed(
  color: ColorResolvable,
  value: Map<string, HelpEntry>
): (ctx: HelpCommandCotext) => MessageEmbed {
  return (ctx: HelpCommandCotext) => {
    const r = createEmbedWithMetaData({ color, ...ctx.executor });
    const fields = createCategoryFields("ja_JP", value, ctx);
    r.setTitle("Configurate");
    r.setDescription(categoryDesc);
    r.addFields(fields);
    return r;
  };
}
export function categoryConfigurateDescription(
  value: Map<string, HelpEntry>
): (ctx: HelpCommandCotext) => string {
  return () => categoryDesc + "\n" + buildCategoryDescription(value);
}
function createEmbedWithMetaDataAndTarget(
  opt: CreateEmbedWithMetaDataOpt,
  nick: string,
  avatar?: string
) {
  return createEmbedWithMetaData(opt).setAuthor(nick, avatar);
}
function wrapString(x: string) {
  return x.trim().length === 0 ? `""` : x;
}
export function rtlUpdate(color: ColorResolvable): UpdateResultResponses {
  return {
    single: (
      result: ConfigurateUsecaseResultTypeSingle,
      target: string,
      exec: Executor,
      nick: string,
      avatar?: string
    ): MessageEmbed => {
      switch (result.type) {
        case "error":
          return createEmbedWithMetaDataAndTarget(
            {
              color,
              ...exec,
            },
            nick,
            avatar
          )
            .setTitle("失敗")
            .setDescription(`エラーが発生しました。`);
        case "not matched":
          return createEmbedWithMetaDataAndTarget(
            {
              color,
              ...exec,
            },
            nick,
            avatar
          )
            .setTitle("失敗")
            .setDescription(
              `別の場所で更新が行われたため中断しました。\nもう一度お試しください。`
            );
        case "ok":
          return createEmbedWithMetaDataAndTarget(
            {
              color,
              ...exec,
            },
            nick,
            avatar
          )
            .setTitle("成功")
            .setDescription(`${target}を更新しました。`)
            .addField("現在の設定", wrapString(String(result.vafter)))
            .addField("古い設定", wrapString(String(result.vbefore)));
        case "same":
          return createEmbedWithMetaDataAndTarget(
            {
              color,
              ...exec,
            },
            nick,
            avatar
          )
            .setTitle("成功")
            .setDescription(`${target}はすでにその値です。`)
            .addField(
              "現在の設定",
              result.before != null ? result.vbefore : result.vafter
            );
      }
    },
    permissionError: (error, target, exec) => {
      const opt = {
        color: color,
        ...exec,
      };
      if (error instanceof SenderPermissionError) {
        return createEmbedWithMetaData(opt)
          .setTitle("権限不足")
          .setDescription("実行者の権限が不足しています。")
          .addField(
            "不足している権限",
            error.required.toArray(false).map((e) => `\`\`${e}\`\``)
          )
          .addField(
            "場所",
            error.place instanceof Guild ? "サーバー" : error.place.toString()
          );
      }
      if (error instanceof NotAllowedError) {
        return createEmbedWithMetaData(opt)
          .setTitle("操作不可")
          .setDescription("その操作を行うことはできません。");
      }
      return createEmbedWithMetaData(opt)
        .setTitle("失敗")
        .setDescription("不明な権限エラーが発生しました。");
    },
    contextError: (err, t, exec) => {
      return createEmbedWithMetaData({
        color,
        ...exec,
      })
        .setTitle("コンテキストエラー")
        .setDescription("この場所では実行できません。");
    },
    invalidKeyError: (err, t, exec) => {
      return createEmbedWithMetaData({
        color,
        ...exec,
      })
        .setTitle("存在しないキー")
        .setDescription(`キー「${err.supplied}」は存在しません。`);
    },
    invalidValueError: (err, t, exec) => {
      return createEmbedWithMetaData({
        color,
        ...exec,
      })
        .setTitle("不正な値")
        .setDescription("この値を設定することはできません。");
    },
    subCommandNeeded: (exec) => {
      return createEmbedWithMetaData({
        ...exec,
        color,
      })
        .setTitle("サブコマンドが必要")
        .setDescription("サブコマンドを指定する必要があります。");
    },
  };
}
