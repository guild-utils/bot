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
    const res = await this.dictionary.updateBefore(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      msg.guild!.id,
      word,
      to ?? ""
    );
    if (res[0] === undefined) {
      return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS_WITH_CREATE, [
        word,
        res[1],
      ]);
    } else {
      return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS_WITH_OVERWRITE, [
        word,
        res[0],
        res[1],
      ]);
    }
  }
}
