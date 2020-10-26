import { ColorResolvable, MessageAttachment } from "discord.js";
import { createEmbedWithMetaData } from "protocol_util-djs";
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
  };
}
