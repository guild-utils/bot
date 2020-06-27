import { Command, CommandStore, KlasaMessage } from "klasa";
import * as GUILD_SETINGS from "../../../guild_settings_keys";
import * as LANG_KEYS from "../../../lang_keys";
function toFullWidth(elm: string) {
  return elm.replace(/[A-Za-z0-9!-~]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });
}
export default class extends Command {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory, {
      usage: "<word:string>",
      runIn: ["text"],
      aliases: ["dwb"],
      description: (lang) =>
        lang.get(LANG_KEYS.COMMAND_DELETE_WORD_DESCRIPTION),
      usageDelim: " ",
    });
  }
  public async run(
    msg: KlasaMessage,
    [word]: [string]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const arr: {
      k: string;
      v?: string;
    }[] = msg.guildSettings.get(GUILD_SETINGS.text2speechDictionaryBefore);
    const index = arr.findIndex(
      ({ k }: { k: string; v?: string }) => toFullWidth(word) === k
    );
    if (index < 0) {
      return msg.sendLocale(LANG_KEYS.COMMAND_DELETE_WORD_SUCCESS);
    }
    await msg.guildSettings.update(
      GUILD_SETINGS.text2speechDictionary.join("."),
      { action: "remove", arrayPosition: index }
    );
    return msg.sendLocale(LANG_KEYS.COMMAND_DELETE_WORD_SUCCESS);
  }
}
