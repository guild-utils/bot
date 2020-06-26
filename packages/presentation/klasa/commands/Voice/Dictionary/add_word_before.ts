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
      usage: "<word:string> [to:string]",
      runIn: ["text"],
      aliases: ["awb"],
      description: (lang) => lang.get(LANG_KEYS.COMMAND_ADD_WORD_DESCRIPTION),
      usageDelim: " ",
    });
  }
  public async run(
    msg: KlasaMessage,
    [word, to]: [string, string?]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const arr: {
      k: string;
      v?: string;
    }[] = msg.guildSettings.get(GUILD_SETINGS.text2speechDictionaryBefore);
    const fword = toFullWidth(word);
    const index = arr.findIndex(
      ({ k }: { k: string; v?: string }) => fword === k
    );
    if (index < 0) {
      await msg.guildSettings.update(
        GUILD_SETINGS.text2speechDictionaryBefore.join("."),
        { k: fword, v: to },
        { action: "add" }
      );
      return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS);
    }
    arr[index] = { k: fword, v: to };
    await msg.guildSettings.update(
      GUILD_SETINGS.text2speechDictionaryBefore.join("."),
      arr,
      { action: "overwrite" }
    );
    return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS);
  }
}
