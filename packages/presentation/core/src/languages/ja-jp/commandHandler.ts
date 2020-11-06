import { ColorResolvable, MessageAttachment } from "discord.js";
import {
  createEmbedWithMetaData,
  executorFromMessage,
} from "protocol_util-djs";
import { inspect } from "util";
import { CommandHandlerResponses } from "../../monitors-v2/commandHandler";

export function CommandHandlerJaJP(
  color: ColorResolvable
): CommandHandlerResponses {
  return {
    commandDisabled: (k, prefix, exec) =>
      createEmbedWithMetaData({
        ...exec,
        color: color,
      }).setDescription(
        `コマンド「${k}」は無効化されています。\n\`\`${prefix} conf remove disabledCommands ${k}\`\`を実行することで有効化できます。`
      ),
    internalError: (err, exec) => {
      return createEmbedWithMetaData({
        ...exec,
        color: color,
      })
        .setTitle("内部エラー")
        .setDescription("コマンドの実行中にエラーが発生しました。")
        .attachFiles([
          new MessageAttachment(
            Buffer.from(inspect(err), "utf-8"),
            "error-details.txt"
          ),
        ]);
    },
    remindPrefix: (prefix, exec) =>
      createEmbedWithMetaData({
        ...exec,
        color,
      }).setDescription(`このサーバーのプレフィックスは${prefix}です。`),
    globalRateLimitReached: (e, rt, m) =>
      createEmbedWithMetaData({
        ...executorFromMessage(m),
        color: color,
      })
        .setTitle("グローバルレートリミット")
        .setDescription("全コマンド対象のレートリミットに到達しました。")
        .addField(
          "クールダウン",
          String(Math.floor((rt - Date.now()) / 1000)) + "秒"
        )
        .addField(
          "詳細",
          `${e[0]}: ${e[1].toString()}リクエスト/${Math.floor(
            e[2] / 1000
          ).toString()}秒`
        ),
  };
}
