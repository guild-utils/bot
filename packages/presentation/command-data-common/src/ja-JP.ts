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
export const start: CommandData = {
  description: "読み上げを開始します。",
  more: [
    `声の種類はmemconf/userconf set speech.kind で変更できます。現在kindに設定できる値は以下のとおりです。\n${WW.VoiceKindArray.join(
      ","
    )}`,
    "基本的に設定はmemconf→userconfの順番で見に行きます。ただし、名前についてはmemconf→nickname→userconfの順番に見に行きます。",
  ].join("\n"),
  ...WW.start,
};

export const VoiceBasic = [end, end_channel, skip, start];
export const add_word: CommandData = {
  description:
    "このコマンドは削除されました。代わりにmdic addを使用してください。",
  ...WW.add_word,
};

export const add_word_after: CommandData = {
  description:
    "このコマンドは削除されました。代わりにadic addを使用してください。",
  ...WW.add_word_after,
};

export const add_word_before: CommandData = {
  description:
    "このコマンドは削除されました。代わりにbdic addを使用してください。",
  ...WW.add_word_before,
};

export const clear: CommandData = {
  description:
    "このコマンドは削除されました。代わりにdict clearを使用してください。",
  ...WW.clear,
};

export const delete_word: CommandData = {
  description:
    "このコマンドは削除されました。代わりにmdic removeを使用してください。",
  ...WW.delete_word,
};

export const delete_word_after: CommandData = {
  description:
    "このコマンドは削除されました。代わりにadic removeを使用してください。",
  ...WW.delete_word_after,
};

export const delete_word_before: CommandData = {
  description:
    "このコマンドは削除されました。代わりにbdic removeを使用してください。",
  ...WW.delete_word_before,
};

export const exportC: CommandData = {
  description:
    "このコマンドは削除されました。代わりにdict exportを使用してください。",
  ...WW.exportC,
};

export const importC: CommandData = {
  description:
    "このコマンドは削除されました。代わりにdict importを使用してください。",
  ...WW.importC,
};

export const VoiceDictionaryOld = [
  add_word,
  add_word_after,
  add_word_before,
  clear,
  delete_word,
  delete_word_after,
  delete_word_before,
  exportC,
  importC,
];
export const jumanpp: CommandData = {
  description: "jumanppで形態素解析を行う。",
  ...WW.jumanpp,
};
export const kuromoji: CommandData = {
  description: "kuromojiで形態素解析を行う。",
  ...WW.kuromoji,
};
export const dictionary: CommandData = {
  description: "export,import,clearの3つのサブコマンドを持っています。",
  more: [
    "export:すべての辞書データをjsonとしてエクスポートします。",
    "import:与えられたjsonから辞書をインポートします。jsonはファイルとして与えてください。",
    "clear:すべての辞書データを削除します。",
  ].join("\n"),
  ...WW.dictionary,
};
export const after_dictionary: CommandData = {
  description: "add,remove,update,listの4つのサブコマンドを持っています。",
  more: [
    "このコマンドはmdicコマンドで設定できる辞書での処理の後に処理される辞書の設定です。",
    "単純置換を行います。(順序が結果に影響する場合があります)",
    "add:辞書に単語を追加する。(例:adic add 2 にゃん,にゃーん)",
    "remove:辞書から単語を削除する。(例:adic remove 2)",
    "update:辞書を上書きする。(例:adic update 2 にゃ)",
    "list:現在の設定内容を確認する。(使い方:adic list)",
  ].join("\n"),
  ...WW.after_dictionary,
};
export const before_dictionary: CommandData = {
  description: "add,remove,update,listの4つのサブコマンドを持っています。",
  more: [
    "このコマンドはmdicコマンドで設定できる辞書での処理の前に処理される辞書の設定です。",
    "単純置換を行います。(順序が結果に影響する場合があります)",
    "add:辞書に単語を追加する。(例:bdic add 2 にゃん,にゃーん)",
    "remove:辞書から単語を削除する。(例:bdic remove 2)",
    "update:辞書を上書きする。(例:bdic update 2 にゃ)",
    "list:現在の設定内容を確認する。(使い方:bdic list)",
  ].join("\n"),
  ...WW.before_dictionary,
};
export const main_dictionary: CommandData = {
  description: "add,remove,update,listの4つのサブコマンドを持っています。",
  more: [
    "このコマンドはメインの辞書を設定するコマンドです。",
    "kuromoji.jsによる形態素解析の結果をもとに辞書を参照して置換が行われます。",
    "add:辞書に単語を追加する。(例mdic add カラス 黒い鳥,名詞)",
    "remove:辞書から単語を削除する。(例:mdic remove にゃん)",
    "update:辞書を上書きする。(例:mdic update にゃん にゃ)",
    "list:現在の設定内容を確認する。(使い方:mdic list)",
  ].join("\n"),
  ...WW.main_dictionary,
};
export const VoiceDictionary = [
  jumanpp,
  kuromoji,
  dictionary,
  after_dictionary,
  main_dictionary,
  before_dictionary,
];
export const All = [
  ...Core,
  ...MemberSettings,
  userconf,
  ...VoiceBasic,
  ...VoiceDictionary,
  ...VoiceDictionaryOld,
];
