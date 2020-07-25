import { Command, CommandStore, KlasaMessage } from "klasa";
import * as LANG_KEYS from "../../../lang_keys";
import { inject, autoInjectable } from "tsyringe";
import { DictionaryRepository } from "domain_configs";

@autoInjectable()
export default class extends Command {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("DictionaryRepository")
    private readonly dictionary: DictionaryRepository
  ) {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.dictionary.removeBefore(msg.guild!.id, word);
    if (r) {
      return msg.sendLocale(LANG_KEYS.COMMAND_DELETE_WORD_SUCCESS_WITH_DELETE, [
        word,
        r,
      ]);
    } else {
      return msg.sendLocale(LANG_KEYS.COMMAND_DELETE_WORD_SUCCESS_WITH_NONE, [
        word,
      ]);
    }
  }
}
