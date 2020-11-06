import { RateLimitEntry, CommandSchema } from "@guild-utils/command-schema";
import { ColorResolvable, Message, MessageEmbed } from "discord.js";
import {
  createEmbedWithMetaData,
  executorFromMessage,
} from "protocol_util-djs";

export function RateLimitLangJaJP(
  color: ColorResolvable
): (
  e: RateLimitEntry,
  rt: number,
  schema: CommandSchema,
  message: Message
) => MessageEmbed {
  return (e, rt, s, m) => {
    return createEmbedWithMetaData({
      ...executorFromMessage(m),
      color: color,
    })
      .setTitle("コマンドレートリミット")
      .setDescription(`コマンドのレートリミットに到達しました。`)
      .addField(
        "クールダウン",
        String(Math.floor((rt - Date.now()) / 1000)) + "秒"
      )
      .addField(
        "詳細",
        `${e[0]}: ${e[1].toString()}リクエスト/${Math.floor(
          e[2] / 1000
        ).toString()}秒`
      );
  };
}
