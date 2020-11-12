import { ColorResolvable } from "discord.js";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { commandTextSupplier } from "../../bootstrap/commands";
import { HelpCommandCotext } from "../../commands-v2/info/help";
import { KeyInfoRecord } from "./index";
function prefix(
  color: ColorResolvable,
  defaultPrefix: string
): KeyInfoRecord[string] {
  return {
    embed: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return createEmbedWithMetaData({
          color,
          ...ctx.executor,
        })
          .setTitle("prefix")
          .setDescription(
            "botのprefixの設定です。\nこの設定を変更するためにはサーバーの管理権限が必要です。"
          )
          .addField(
            "set",
            "prefixの設定を行います。\n以下の例では!に設定しています。\n" +
              `${ctx.prefix ?? defaultPrefix}set prefix !`
          )
          .addField(
            "get",
            "prefixの確認を行います。\n" +
              `${ctx.prefix ?? defaultPrefix}get prefix`
          )
          .addField(
            "reset",
            "prefixをデフォルトに戻します。\n" +
              `${ctx.prefix ?? defaultPrefix}reset prefix`
          );
      },
    }),
    summary: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return `botのprefixの設定です。${
          ctx.prefix ?? defaultPrefix
        }help keys prefixで詳細を確認できます。`;
      },
    }),
  };
}
function disabledCommands(
  color: ColorResolvable,
  defaultPrefix: string
): KeyInfoRecord[string] {
  return {
    embed: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return createEmbedWithMetaData({
          color,
          ...ctx.executor,
        })
          .setTitle("disabledCommands")
          .setDescription(
            "コマンドの無効化の設定です。\nこの設定を変更するためにはサーバーの管理権限が必要です。"
          )
          .addField(
            "set",
            "コマンドの無効化の設定を行います。\n以下の例ではjumanppとmemconf.memberコマンドを無効に設定しています。\n" +
              `${
                ctx.prefix ?? defaultPrefix
              }set disabledCommands jumanpp memconf.member`
          )
          .addField(
            "add",
            "コマンドの無効化の設定を行います。\n以下の例ではjumanppを無効なコマンドのリストに追加しています。\n" +
              `${ctx.prefix ?? defaultPrefix}add disabledCommands jumanpp`
          )
          .addField(
            "remove",
            "コマンドの無効化の設定を行います。\n以下の例ではjumanppを無効なコマンドのリストから削除しています。\n" +
              `${ctx.prefix ?? defaultPrefix}remove disabledCommands jumanpp`
          )
          .addField(
            "get",
            "コマンドの無効化の設定の確認を行います。\n" +
              `${ctx.prefix ?? defaultPrefix}get disabledCommands`
          )
          .addField(
            "reset",
            "コマンドの無効化の設定をデフォルトに戻します。\n" +
              `${ctx.prefix ?? defaultPrefix}reset disabledCommands`
          );
      },
    }),
    summary: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return `botのコマンドの無効化の設定です。\n${
          ctx.prefix ?? defaultPrefix
        }help keys disabledCommandsで詳細を確認できます。`;
      },
    }),
  };
}
export function coreKeys(
  color: ColorResolvable,
  defaultPrefix: string
): KeyInfoRecord {
  return {
    prefix: prefix(color, defaultPrefix),
    disabledCommands: disabledCommands(color, defaultPrefix),
  };
}
