import * as WW from "./world-wide";
import { CommandData } from "./command-data";

export const help: CommandData = {
  description: "コマンドリストと説明を表示します。",
  more: [
    "「help command」でコマンドについての情報が確認できます。(例: help help)",
    "「help category」でカテゴリに所属しているサブカテゴリとコマンドについて確認できます。(例: help general)",
    "「help category/subcategory」でサブカテゴリに所属しているコマンドについて確認できます。(例: help general/chat bot info)",
  ].join("\n"),
  ...WW.help,
};

export const info: CommandData = {
  description: "このボットに関するいくつかの情報を提供します。",
  ...WW.info,
};

export const invite: CommandData = {
  description: "ボットの招待リンクを表示します。",
  ...WW.invite,
};

export const ping: CommandData = {
  description: "Discordへの応答速度を計測します。",
  ...WW.ping,
};

export const stats: CommandData = {
  description: "ボットの詳細と、統計情報を表示します。",
  ...WW.stats,
};

export const conf: CommandData = {
  description: "サーバーでの設定を変更/表示します。",
  ...WW.conf,
};
export const Core = [help, info, invite, ping, stats, conf];
export const memconf: CommandData = {
  description: "メンバーの設定を変更/表示します。",
  ...WW.memconf,
};
export const memconf_member: CommandData = {
  description: "メンバーの設定を変更/表示します。",
  ...WW.memconf_member,
};
export const MemberSettings = [memconf, memconf_member];
export const userconf: CommandData = {
  description: "ユーザー設定を変更/表示します。",
  ...WW.userconf,
};
export const end: CommandData = {
  description: "読み上げを終了します。",
  ...WW.end,
};
export const end_channel: CommandData = {
  description: "テキストチャンネルでの読み上げを終了します。",
  ...WW.end_channel,
};
export const skip: CommandData = {
  description: "現在読み上げているテキストをスキップします。",
  ...WW.skip,
};
const VoiceKindArray: string[] = [
  "normal",
  "angry",
  "happy",
  "neutral",
  "sad",
  "mei_angry",
  "mei_bashful",
  "mei_happy",
  "mei_normal",
  "mei_sad",
  "takumi_angry",
  "takumi_happy",
  "takumi_normal",
  "takumi_sad",
  "alpha",
  "beta",
  "gamma",
  "delta",
];
export const start: CommandData = {
  description: "読み上げを開始します。",
  more: [
    `声の種類はmemconf/userconf set speech.kind で変更できます。現在kindに設定できる値は以下のとおりです。\n${VoiceKindArray.join(
      ","
    )}`,
    "基本的に設定はmemconf→userconfの順番で見に行きます。ただし、名前についてはmemconf→nickname→userconfの順番に見に行きます。",
  ].join("\n"),
  ...WW.start,
};

export const VoiceBasic = [end, end_channel, skip, start];
export const add_word: CommandData = {
  description: "単語をメインの辞書へ追加します。",
  ...WW.add_word,
};

export const add_word_after: CommandData = {
  description:
    "単語をメインの辞書での処理が終わった後に処理される辞書へ追加します。",
  ...WW.add_word_after,
};

export const add_word_before: CommandData = {
  description: "単語をメインの辞書での処理の前に処理される辞書へ追加します。",
  ...WW.add_word_before,
};

export const clear: CommandData = {
  description: "辞書を削除します。",
  ...WW.clear,
};

export const delete_word: CommandData = {
  description: "単語をメインの辞書から削除します。",
  ...WW.delete_word,
};

export const delete_word_after: CommandData = {
  description:
    "単語をメインの辞書での処理が終わった後に処理される辞書から削除します。",
  ...WW.delete_word_after,
};

export const delete_word_before: CommandData = {
  description: "単語をメインの辞書での処理の前に処理される辞書から削除します。",
  ...WW.delete_word_before,
};

export const exportC: CommandData = {
  description: "辞書をエクスポートします。",
  ...WW.exportC,
};

export const importC: CommandData = {
  description: "辞書をインポートします。",
  ...WW.importC,
};

export const jumanpp: CommandData = {
  description: "jumanppで形態素解析を行う。",
  ...WW.jumanpp,
};

export const kuromoji: CommandData = {
  description: "kuromojiで形態素解析を行う。",
  ...WW.kuromoji,
};
export const VoiceDictionary = [
  add_word,
  add_word_after,
  add_word_before,
  clear,
  delete_word,
  delete_word_after,
  delete_word_before,
  exportC,
  importC,
  jumanpp,
  kuromoji,
];
