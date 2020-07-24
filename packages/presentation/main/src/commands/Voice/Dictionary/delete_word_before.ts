import { Command, CommandStore, KlasaMessage } from "klasa";
import * as GUILD_SETTINGS from "presentation_shared-config/guild";
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
    }[] = msg.guildSettings.get(GUILD_SETTINGS.text2speechDictionaryBefore);
    const update = arr.filter(
      ({ k }: { k: string; v?: string }) => toFullWidth(word) !== k
    );
    await msg.guildSettings.update(
      GUILD_SETTINGS.text2speechDictionaryBefore.join("."),
      update,
      { action: "overwrite" }
    );
    return msg.sendLocale(LANG_KEYS.COMMAND_DELETE_WORD_SUCCESS);
  }
}
