import {
  createEmbedWithMetaData,
  EmbedWithExecutorType,
} from "protocol_util-djs";
import {
  MessageEmbed,
  version as discordVersion,
  GuildMember,
  User,
  ColorResolvable,
} from "discord.js";
import { CommandInviteTexts } from "../../commands/info/invite";
import { CommandPingTexts } from "../../commands/info/ping";
import {
  CommandHelpTexts,
  HelpCommandCotext,
  HelpEntry,
} from "../../commands/info/help";
import { buildCategoryDescription, createCategoryFields } from "../util";
import { BUILD_DATE, KUBE_NODE_NAME, KUBE_POD_NAME } from "../../bootstrap/env";

export function statsEmbed(
  {
    memory,
    uptimeInMs,
    guilds,
    channels,
    color,
  }: {
    memory: number;
    uptimeInMs: number;
    guilds: number;
    channels: number;
    color: ColorResolvable;
  },
  { user, member }: { user: User; member?: GuildMember | null }
): MessageEmbed {
  const embed = createEmbedWithMetaData({ color: color, user, member });
  embed.setTitle("統計情報");
  embed.addField("メモリ使用量", String(memory) + "MB", true);
  embed.addField(
    "稼働時間",
    String(Math.round(uptimeInMs / 1000 / 60 / 60)) + "時間",
    true
  );
  embed.addField("サーバ数", String(guilds) + "サーバー", true);
  embed.addField("チャンネル数", String(channels) + "チャンネル", true);
  embed.addField("Discord.js", discordVersion, true);
  embed.addField("Node.js", process.version, true);
  embed.addField("ビルド日時", BUILD_DATE);
  embed.addField("Pod", KUBE_POD_NAME);
  embed.addField("Node", KUBE_NODE_NAME);

  return embed;
}
export const rtlInvite: CommandInviteTexts = {
  title: "招待リンク",
  description: [
    "[サポートサーバー](https://discord.gg/xxkzCHU)",
    "[メインボット](https://discord.com/oauth2/authorize?client_id=708254048981352459&permissions=3271744&scope=bot+applications.commands)",
    "[サブボット1](https://discord.com/oauth2/authorize?client_id=731698703903227954&permissions=3271744&scope=bot+applications.commands)",
    "[サブボット2](https://discord.com/oauth2/authorize?client_id=747006457219645440&permissions=3271744&scope=bot+applications.commands)",
  ].join("\n"),
};
export function rtlPing(color: ColorResolvable): CommandPingTexts {
  return {
    ping: (arg) =>
      createEmbedWithMetaData({
        ...arg,
        color,
      })
        .setTitle("計測中…")
        .setDescription("しばらくお待ち下さい"),
    pingText: "Pinging…",
    pingpong: (ts, p, exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("応答時間")
        .setDescription(
          [
            "平時は往復所要時間500ms以下、ハートビート300ms以下程度だと思われます。",
            "低速時/障害時は[Discord Status](https://discordstatus.com/)、[サポートサーバー](https://discord.gg/xxkzCHU)等をご確認ください。",
          ].join("\n")
        )
        .addField("往復所要時間", String(ts) + "ms")
        .addField("ハートビート", String(p) + "ms"),
    pingpongText: "Pong!",
  };
}
export function rtlHelp(color: ColorResolvable): CommandHelpTexts {
  return {
    entryNotFound: (ctx) =>
      createEmbedWithMetaData({ color, ...ctx.executor })
        .setTitle("Not Found")
        .setDescription(
          "指定されたエントリは見つかりませんでした。\nキーをもう一度ご確認ください。"
        ),
  };
}
const categoryDesc = "botの情報に関するコマンド";
export function categoryInfoEmbed(
  color: ColorResolvable,
  value: Map<string, HelpEntry>
): (ctx: HelpCommandCotext) => MessageEmbed {
  return (ctx) =>
    createEmbedWithMetaData({ color, ...ctx.executor })
      .setTitle("Info")
      .setDescription(categoryDesc)
      .addFields(createCategoryFields("ja_JP", value, ctx));
}
export function categoryInfoDescription(
  value: Map<string, HelpEntry>
): (ctx: HelpCommandCotext) => string {
  return () => categoryDesc + "\n" + buildCategoryDescription(value);
}
export function rtlInfo(color: ColorResolvable): EmbedWithExecutorType {
  return (args) =>
    createEmbedWithMetaData({ color, ...args })
      .setTitle("このBotについて")
      .setDescription(
        "ちょっと機能が豊富な読み上げbotです。\n詳細はhelpコマンド等を参照してください。"
      )
      .addField(
        "リンク",
        [
          "[Webドキュメント](https://guj.tignear.com/)",
          "[サポートサーバー](https://discord.gg/xxkzCHU)",
          "[GitHub](https://github.com/guild-utils/bot)",
        ].join("\n")
      )
      .addField("制作", "tig#2552", true)
      .addField("アイコン", "???", true);
}
