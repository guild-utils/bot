import * as LANG_KEYS from "../../../lang_keys";
import { DictionaryRepository } from "domain_configs";
import { autoInjectable, inject } from "tsyringe";
import { CommandStore, KlasaMessage } from "klasa";
import { CommandEx } from "presentation_klasa-core-command-rewrite";

@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("DictionaryRepository")
    private readonly dictionary: DictionaryRepository
  ) {
    super(store, file, directory, {
      usage:
        "<word:string> [to:string] [pos:string] [pos_detail_1:string] [pos_detail_2:string] [pos_detail_3:string]",
      runIn: ["text"],
      aliases: ["aw"],
      description: (lang) => lang.get(LANG_KEYS.COMMAND_ADD_WORD_DESCRIPTION),
      usageDelim: " ",
    });
  }
  public async run(
    msg: KlasaMessage,
    [word, to, p, p1, p2, p3]: [
      string,
      string?,
      string?,
      string?,
      string?,
      string?
    ]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const res = await this.dictionary.updateMain(msg.guild!.id, word, {
      to: to ?? "",
      p,
      p1,
      p2,
      p3,
    });
    if (res[0] === undefined) {
      return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS_WITH_CREATE, [
        word,
        res[1].to,
      ]);
    } else {
      return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS_WITH_OVERWRITE, [
        word,
        res[0],
        res[1].to,
      ]);
    }
  }
}
