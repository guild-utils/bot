import { LanguageStore, LanguageOptions } from "klasa";
import * as moment from "moment-timezone";
import { LANG_KEYS } from "presentation_core";
import { GUJ_MAIN_LANG_TYPE } from "../lang_keys";
import CoreLanguage from "presentation_core/languages/ja-JP";
export default class extends CoreLanguage {
  private GUJ_EVENTS_MESSAGES: LANG_KEYS.GUJ_CORE_LANG_TYPE &
    GUJ_MAIN_LANG_TYPE = {
    GOOGLE_SPREAD_SHEET_UPDATE_SUCCESS: "アップデート成功",
    INVALID_GOOGLE_SPREAD_SHEET_FORMAT:
      "Google Spread SheetのIDまたはURLを指定してください。",
    NOTIFY_TO_NOTIFICATION_CHANNEL: (event, t, now) => {
      const diff = moment.duration(t.diff(now));
      return [
        `**${
          event.name
        }**が**${diff.minutes()}**分**${diff.seconds()}**秒後に始まります。`,
        ...[...event.header]
          .filter((e) => e !== "name")
          .map((e) => `${e}:${event.desc[e]}`),
      ].join("\n");
    },
    COMMAND_LIST_DESCRIPTION:
      "イベントのリスト、またはシートのリストを表示します。",
    COMMAND_NEXT_DESCRIPTION: "イベントを近い順に並べます。",
    COMMAND_PUT_DESCRIPTION: "イベントを追加します。",
    COMMAND_UPDATE_DESCRIPTION: "スプレッドシートの更新を適用します。",

    COMMAND_ADD_WORD_DESCRIPTION: "単語を辞書に追加します。",
    COMMAND_ADD_WORD_SUCCESS_WITH_CREATE: (from: string, to: string) =>
      `「${from}」から「${to}」への変換を辞書に追加しました。`,
    COMMAND_ADD_WORD_SUCCESS_WITH_OVERWRITE: (
      from: { from: string; to: string },
      to: { from: string; to: string }
    ) =>
      `「${from.from}」から「${from.to}」への変換を「${to.from}」から「${to.to}」への変換で上書きしました。`,
    COMMAND_DELETE_WORD_DESCRIPTION: "単語を辞書から削除します。",
    COMMAND_DELETE_WORD_SUCCESS_WITH_DELETE: (from: string, to: string) =>
      `「${from}」から「${to}」への変換を削除しました。`,
    COMMAND_DELETE_WORD_SUCCESS_WITH_NONE: (from: string) =>
      `「${from}」が見つかりませんでした`,
    COMMAND_CONF_GUILD_MEMBER_DESCRIPTION:
      "サーバー単位でのユーザーの設定をする。",
    COMMAND_JUMANPP_DESCRIPTION: "jumanppで形態素解析する。",
    COMMAND_KUROMOJI_DESCRIPTION: "kuromojiで形態素解析する。",
    COMMAND_IMPORT_COMPLETE: "インポートが完了しました。",
    COMMAND_EXPORT_SUCCESS: "エクスポートが完了しました。",
    COMMAND_CLEAR_SUCCESS: "辞書をすべて削除しました。",
    COMMAND_MAIN_DICT_INVALID_REMOVE_FORMAT:
      "第二引数は不要です。「mdic remove 削除したい単語」のように使用してください。",
    INVALID_ADD_FORMAT:
      "「数字 変換前の単語:変換後の単語」あるいは、「変換後の単語」のように使用してください。",
    INVALID_INDEX_RANGE: "その番号のエントリーは存在しません。",
    INVALID_REMOVE_FORMAT:
      "第二引数は不要です。また第一引数には必ず削除したいエントリーの番号を指定する必要があります。",
    INVALID_UPDATE_FORMAT:
      "第一引数には必ず更新したいエントリーの番号を指定する必要があります。",
    INVALID_SIMPLE_DICT_ENTRY:
      "「変換前の単語:変換後の単語」といったフォーマットである必要があります。",
    INVALID_MAIN_DICT_ENTRY:
      "「変換後の単語:フィルター:フィルター1:フィルター2:フィルター3」といったフォーマットである必要があります。\nなお、フィルターはオプションです。",
    COMMAND_MAIN_DICT_REQUIRE_KEY: "第一引数は必須です。",
    ...this.CORE_MESSAGES,
  };
  constructor(
    store: LanguageStore,
    file: string[],
    directory: string,
    options?: LanguageOptions
  ) {
    super(store, file, directory, options);

    this.language = { ...this.KLASA_MESSAGES, ...this.GUJ_EVENTS_MESSAGES };
  }

  async init(): Promise<void> {
    await super.init();
  }
}
