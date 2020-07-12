/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Language, util } from "klasa";
import { GUJ_CORE_LANG_TYPE } from "../lang_keys";
export default class extends Language {
  protected KLASA_MESSAGES = {
    DEFAULT: (key) => `${key} はまだ日本語に翻訳されていません。`,
    DEFAULT_LANGUAGE: "初期言語",
    PREFIX_REMINDER: (prefix = `@${this.client.user!.tag}`) =>
      `このサーバーのプレフィックス: ${
        Array.isArray(prefix)
          ? prefix.map((pre) => `\`${pre}\``).join(", ")
          : `\`${prefix}\``
      }`,
    SETTING_GATEWAY_EXPECTS_GUILD:
      "パラメーター <Guild> は Guild または Guild Object を期待します。",
    SETTING_GATEWAY_VALUE_FOR_KEY_NOEXT: (data, key) =>
      `キー ${key} の値 ${data} は存在しません。`,
    SETTING_GATEWAY_VALUE_FOR_KEY_ALREXT: (data, key) =>
      `キー ${key} の値 ${data} は既に存在します。`,
    SETTING_GATEWAY_SPECIFY_VALUE:
      "追加または絞り込む値を指定する必要があります。",
    SETTING_GATEWAY_KEY_NOT_ARRAY: (key) =>
      `キー ${key} は配列ではありません。`,
    SETTING_GATEWAY_KEY_NOEXT: (key) =>
      `キー ${key} は現在のデータスキーマに存在しません。`,
    SETTING_GATEWAY_INVALID_TYPE:
      "タイプパラメーターは add または remove である必要があります。",
    SETTING_GATEWAY_INVALID_FILTERED_VALUE: (piece, value) =>
      `${piece.key} はこの値を受け付けません: ${value}`,
    RESOLVER_MULTI_TOO_FEW: (name, min = 1) =>
      `${name} が小さすぎます。少なくとも ${min} 必要です。`,
    RESOLVER_INVALID_BOOL: (name) =>
      `${name} は true または false である必要があります。`,
    RESOLVER_INVALID_CHANNEL: (name) =>
      `${name} はチャンネルタグまたは有効なチャンネルIDである必要があります。`,
    RESOLVER_INVALID_CUSTOM: (name, type) =>
      `${name} は有効な ${type} である必要があります。`,
    RESOLVER_INVALID_DATE: (name) =>
      `${name} は有効な日付である必要があります。`,
    RESOLVER_INVALID_DURATION: (name) =>
      `${name} は有効な期間文字列である必要があります。`,
    RESOLVER_INVALID_EMOJI: (name) =>
      `${name} はカスタム絵文字タグまたは有効な絵文字IDである必要があります。`,
    RESOLVER_INVALID_FLOAT: (name) =>
      `${name} は有効な数値である必要があります。`,
    RESOLVER_INVALID_GUILD: (name) =>
      `${name} は有効なサーバーIDである必要があります。`,
    RESOLVER_INVALID_INT: (name) => `${name} は整数である必要があります。`,
    RESOLVER_INVALID_LITERAL: (name) =>
      `あなたの選択肢はいずれとも一致しませんでした: ${name}`,
    RESOLVER_INVALID_MEMBER: (name) =>
      `${name} はメンションまたは有効なユーザーIDである必要があります、`,
    RESOLVER_INVALID_MESSAGE: (name) =>
      `${name} は有効なメッセージIDである必要があります。`,
    RESOLVER_INVALID_PIECE: (name, piece) =>
      `${name} は有効な ${piece} の名前である必要があります。`,
    RESOLVER_INVALID_REGEX_MATCH: (name, pattern) =>
      `${name} は正規表現 \`${pattern}\` に従う必要があります。`,
    RESOLVER_INVALID_ROLE: (name) =>
      `${name} は役職メンションまたは役職IDである必要があります。`,
    RESOLVER_INVALID_STRING: (name) =>
      `${name} は有効な文字列である必要があります。`,
    RESOLVER_INVALID_TIME: (name) =>
      `${name} は有効な期間または日付文字列である必要があります。`,
    RESOLVER_INVALID_URL: (name) => `${name} は有効なURLである必要があります。`,
    RESOLVER_INVALID_USER: (name) =>
      `${name} はメンションまたは有効なユーザーIDである必要があります。`,
    RESOLVER_STRING_SUFFIX: " 文字",
    RESOLVER_MINMAX_EXACTLY: (name, min, suffix) =>
      `${name} は ${min}${suffix} である必要があります。`,
    RESOLVER_MINMAX_BOTH: (name, min, max, suffix) =>
      `${name} は ${min} から ${max}${suffix} の間である必要があります。`,
    RESOLVER_MINMAX_MIN: (name, min, suffix) =>
      `${name} は ${min}${suffix} より大きい必要があります。`,
    RESOLVER_MINMAX_MAX: (name, max, suffix) =>
      `${name} は ${max}${suffix} より小さい必要があります。`,
    REACTIONHANDLER_PROMPT: "どのページにジャンプしますか？",
    COMMANDMESSAGE_MISSING: "一つ以上の必須の引数が不足しています。",
    COMMANDMESSAGE_MISSING_REQUIRED: (name) => `${name} 引数が必要です。`,
    COMMANDMESSAGE_MISSING_OPTIONALS: (possibles) =>
      `必要なオプションが不足しています: (${possibles})`,
    COMMANDMESSAGE_NOMATCH: (possibles) =>
      `あなたの選択肢は次のいずれとも一致しませんでした: (${possibles})`,
    MONITOR_COMMAND_HANDLER_REPROMPT: (tag, error, time, abortOptions) =>
      `${tag} | **${error}** | **${time}** 秒の間に有効な引数を入力してください。**${abortOptions.join(
        "**, **"
      )}** と打つとこのプロンプトは中止されます。`,
    MONITOR_COMMAND_HANDLER_REPEATING_REPROMPT: (tag, name, time) =>
      `${tag} | **${name}** は繰り返しの引数です | **${time}** 秒の間に追加の引数を入力してください。**"CANCEL"** と打つとこのプロンプトは中止されます。`,
    MONITOR_COMMAND_HANDLER_ABORTED: "中断しました",
    INHIBITOR_COOLDOWN: (remaining) =>
      `このコマンドを使用したばかりです。${remaining}秒でこのコマンドを再度使用できます。`,
    INHIBITOR_DISABLED_GUILD:
      "このコマンドはこのギルドの管理者によって無効にされています。",
    INHIBITOR_DISABLED_GLOBAL:
      "このコマンドはボットの所有者によって無効化されています。",
    INHIBITOR_MISSING_BOT_PERMS: (missing) =>
      `不十分なアクセス許可。**${missing}** が不足しています。`,
    INHIBITOR_NSFW: "NSFWコマンドはNSFWチャンネルでのみ使用できます。",
    INHIBITOR_PERMISSIONS: "このコマンドを使用する権限がありません。",
    INHIBITOR_REQUIRED_SETTINGS: (settings) =>
      `サーバーは設定 **${settings.join(
        ", "
      )}** が不足しているためコマンドを実行できません。`,
    INHIBITOR_RUNIN: (types) =>
      `このコマンドは ${types} チャンネルでのみ有効です。`,
    INHIBITOR_RUNIN_NONE: (name) =>
      `${name}コマンドは、どのチャンネルでも実行出来るようになっていません。`,
    COMMAND_BLACKLIST_DESCRIPTION:
      "ユーザーやサーバーをブラックリストに登録、解除します。",
    COMMAND_BLACKLIST_SUCCESS: (
      usersAdded,
      usersRemoved,
      guildsAdded,
      guildsRemoved
    ) =>
      [
        usersAdded.length
          ? `**ユーザーが追加されました**\n${util.codeBlock(
              "",
              usersAdded.join(", ")
            )}`
          : "",
        usersRemoved.length
          ? `**ユーザーが削除されました**\n${util.codeBlock(
              "",
              usersRemoved.join(", ")
            )}`
          : "",
        guildsAdded.length
          ? `**サーバーが追加されました**\n${util.codeBlock(
              "",
              guildsAdded.join(", ")
            )}`
          : "",
        guildsRemoved.length
          ? `**サーバーが削除されました**\n${util.codeBlock(
              "",
              guildsRemoved.join(", ")
            )}`
          : "",
      ]
        .filter((val) => val !== "")
        .join("\n"),
    COMMAND_EVAL_DESCRIPTION:
      "任意のJavaScriptを実行します。ボットオーナーのみ使用できます。",
    COMMAND_EVAL_EXTENDEDHELP: [
      "evalコマンドはコードを評価し、発生したエラーは全て処理されます。",
      "またフラグ機能も使用できます。--silent または --depth=number 、--async をつけることで出力をカスタマイズします。",
      "--silent フラグは何も出力させません",
      "--depth フラグは数値を受け入れ、例えば、--depth=2 はutil.inspectの深さをカスタマイズします。",
      "--async フラグはawaitを使用するためにコードを非同期関数に包みます、しかし、何かを返すことを望むなら、returnキーワードが必要になります。",
      "--showHidden フラグはutil.inspectでshowHiddenオプションを有効にします。",
      "出力が大きすぎる場合は出力をファイルとして、またはボットにATTACH_FILES権限がない場合はコンソールに出力します。",
    ].join("\n"),
    COMMAND_UNLOAD: (type, name) =>
      `✅ ${type}: ${name} をアンロードしました。`,
    COMMAND_EVAL_ERROR: (time, output, type) =>
      `**エラー**:${output}\n**型**:${type}\n${time}`,
    COMMAND_EVAL_OUTPUT: (time, output, type) =>
      `**出力**:${output}\n**型**:${type}\n${time}`,
    COMMAND_EVAL_SENDFILE: (time, type) =>
      `出力が長すぎます...結果をファイルとして送信しました。\n**型**:${type}\n${time}`,
    COMMAND_EVAL_SENDCONSOLE: (time, type) =>
      `出力が長すぎます...結果をコンソールに送信しました。\n**型**:${type}\n${time}`,
    COMMAND_UNLOAD_DESCRIPTION: "ピースをアンロードします。",
    COMMAND_UNLOAD_WARN:
      "あなたはおそらくそれをアンロードしたくないでしょう。なぜなら、それを再び有効にするコマンドを実行することができないからです",
    COMMAND_TRANSFER_ERROR:
      "❌ そのファイルはすでに転送されているか、存在していません。",
    COMMAND_TRANSFER_SUCCESS: (type, name) =>
      `✅ ${type}: ${name} の転送に成功しました。`,
    COMMAND_TRANSFER_FAILED: (type, name) =>
      `${type}の転送: クライアントへの${name}が失敗しました。コンソールを確認してください。`,
    COMMAND_TRANSFER_DESCRIPTION:
      "コアピースをそれぞれのフォルダに転送します。",
    COMMAND_RELOAD: (type, name, time) =>
      `✅ ${type}: ${name} を再読み込みしました。(所要時間: ${time})`,
    COMMAND_RELOAD_FAILED: (type, name) =>
      `❌ ${type}: ${name} の再読み込みに失敗しました。コンソールを確認してください。`,
    COMMAND_RELOAD_ALL: (type, time) =>
      `✅ ${type} を全て再読み込みしました。(所要時間: ${time})`,
    COMMAND_RELOAD_EVERYTHING: (time) =>
      `✅ ファイルを再読み込みしました。(所要時間: ${time})`,
    COMMAND_RELOAD_DESCRIPTION: "ピースを再読み込みします。",
    COMMAND_REBOOT: "再起動...",
    COMMAND_REBOOT_DESCRIPTION: "ボットを再起動します。",
    COMMAND_LOAD: (time, type, name) =>
      `✅ ${type}: ${name} を読み込みました。(所要時間: ${time})`,
    COMMAND_LOAD_FAIL:
      "ファイルが存在しないか、ファイルのロード中にエラーが発生しました。コンソールを確認してください。",
    COMMAND_LOAD_ERROR: (type, name, error) =>
      `❌ ${type}: ${name} の読み込みに失敗しました。原因:${util.codeBlock(
        "js",
        error
      )}`,
    COMMAND_LOAD_DESCRIPTION: "ボットからピースを読み込みます。",
    COMMAND_PING: "計測中...",
    COMMAND_PING_DESCRIPTION: "Discordへの応答速度を計測します。",
    COMMAND_PINGPONG: (diff, ping) =>
      `Pong! (往復所要時間: ${diff}ms、Heartbeat: ${ping}ms)`,
    COMMAND_INVITE: () => [
      `サーバーに${this.client.user!.username}を追加するには:`,
      `${this.client.invite}`,
      "バグを見つけたら https://gitlab.com/guild-utils-j/guild-utils-j/-/issues へお願いします。",
    ],
    COMMAND_INVITE_DESCRIPTION: "ボットの招待リンクを表示します。",
    COMMAND_INFO: [
      "いまのところこのBotは読み上げが可能です。",
      "詳細はhelpコマンドまたは https://gitlab.com/guild-utils-j/guild-utils-j/-/blob/master/README.md を参照してください。",
      "プログラム:tig#2552 アイコン:匿名希望らしいので伏せます",
    ],
    COMMAND_INFO_DESCRIPTION: "このボットに関するいくつかの情報を提供します。",
    COMMAND_HELP_DESCRIPTION: "コマンドリストと説明を表示します。",
    COMMAND_HELP_NO_EXTENDED: "拡張ヘルプは利用出来ません。",
    COMMAND_HELP_DM: "📥 | コマンドリストをDMに送信しました。",
    COMMAND_HELP_NODM:
      "❌ | あなたは私からのDMを無効にしています。なのでコマンドリストを送信する事が出来ません。",
    COMMAND_HELP_USAGE: (usage) => `使用法 :: ${usage}`,
    COMMAND_ENABLE: (type, name) => `+ ${type}: ${name} を有効にしました。`,
    COMMAND_HELP_EXTENDED: "拡張ヘルプ ::",
    COMMAND_ENABLE_DESCRIPTION:
      "command/inhibitor/monitor/finalizerを再度有効にするか、一時的に有効にします。再起動するとデフォルトの状態に戻ります。",
    COMMAND_DISABLE: (type, name) => `+ ${type}: ${name} を無効にしました。`,
    COMMAND_DISABLE_DESCRIPTION:
      "command/inhibitor/monitor/finalizer/eventを再度無効にするか、一時的に無効にします。再起動するとデフォルトの状態に戻ります。",
    COMMAND_DISABLE_WARN:
      "おそらくそれを無効にしたくないでしょう。コマンドを実行して再び有効にすることはできないからです",
    COMMAND_CONF_NOKEY: "キーを指定する必要があります。",
    COMMAND_CONF_NOVALUE: "値を指定する必要があります。",
    COMMAND_CONF_GUARDED: (name) =>
      `${util.toTitleCase(name)} は無効にできません。`,
    COMMAND_CONF_UPDATED: (key, response) =>
      `キー **${key}** のアップデートに成功: \`${response}\``,
    COMMAND_CONF_KEY_NOT_ARRAY:
      "このキーは配列型ではありません。代わりに 'reset' アクションを使用してください。",
    COMMAND_CONF_GET_NOEXT: (key) => `キー **${key}** は存在しないようです。`,
    COMMAND_CONF_GET: (key, value) => `キー **${key}** の値: \`${value}\``,
    COMMAND_CONF_RESET: (key, response) =>
      `キー **${key}** はリセットされました: \`${response}\``,
    COMMAND_CONF_NOCHANGE: (key) => `**${key}** はすでにその値です。`,
    COMMAND_CONF_SERVER_DESCRIPTION: "サーバーごとに設定を定義する。",
    COMMAND_CONF_SERVER: (key, list) => `**サーバー設定${key}**\n${list}`,
    COMMAND_CONF_USER_DESCRIPTION: "ユーザーごとに設定を定義する。",
    COMMAND_CONF_USER: (key, list) => `**ユーザー設定${key}**\n${list}`,
    COMMAND_STATS: (
      memUsage,
      uptime,
      users,
      guilds,
      channels,
      klasaVersion,
      discordVersion,
      processVersion,
      message
    ) => [
      "= 統計情報 =",
      "",
      `• 使用メモリ   :: ${memUsage} MB`,
      `• 起動時間     :: ${uptime}`,
      `• ユーザー数   :: ${users}`,
      `• サーバー数   :: ${guilds}`,
      `• チャンネル数 :: ${channels}`,
      `• Klasa        :: v${klasaVersion}`,
      `• Discord.js   :: v${discordVersion}`,
      `• Node.js      :: ${processVersion}`,
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      `• Shard        :: ${(message.guild ? message.guild.shardID : 0) + 1} / ${
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.client.options as any).totalShardCount
      }`,
    ],
    COMMAND_STATS_DESCRIPTION: "ボットの詳細と、統計情報を表示します。",
    MESSAGE_PROMPT_TIMEOUT: "プロンプトがタイムアウトしました。",
    TEXT_PROMPT_ABORT_OPTIONS: ["中断", "停止", "取り消し"],
  };
  protected CORE_MESSAGES: GUJ_CORE_LANG_TYPE = {
    COMMAND_END_SUCCESS: "読み上げを終了しました。",
    COMMAND_END_DESCRIPTION: "読み上げを終了します。",
    COMMAND_START_DESCRIPTION: "読み上げを開始します。",
    COMMAND_START_FAILED_WITH_BOT_NOT_JOINABLE:
      "botはボイスチャンネルに接続できません。",
    COMMAND_START_FAILED_WITH_USER_NOT_IN_VC:
      "ユーザーがボイスチャンネルに接続していません。",
    COMMAND_START_SUCCESS: "読み上げを開始しました。",
    COMMAND_START_EXTENDED_HELP: (arr) => {
      return [
        `声の種類はmemconf/userconf set speech.kind で変更できます。現在kindに設定できる値は以下のとおりです。\n${arr.join(
          ","
        )}`,
        "基本的に設定はmemconf→userconfの順番で見に行きます。ただし、名前についてはmemconf→nickname→userconfの順番に見に行きます。",
      ].join("\n");
    },
    COMMAND_SKIP_DESCRIPTION: "現在読み上げている文章を飛ばします。",
  };
}
