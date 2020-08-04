import { CommandStore, KlasaMessage } from "klasa";
import { CommandEx } from "presentation_klasa-core-command-rewrite";
import { DictionaryRepository } from "domain_configs";
import { autoInjectable, inject } from "tsyringe";
import { DictionaryJson } from "../../../text2speech";
import * as LANG_KEYS from "../../../lang_keys";
import { MessageAttachment } from "discord.js";
@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("DictionaryRepository")
    private readonly dictionary: DictionaryRepository
  ) {
    super(store, file, directory);
  }

  async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | null> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const all = await this.dictionary.getAll(msg.guild!.id);
    const main: DictionaryJson["main"] = {};
    [...all.main.entries()].forEach(([k, v]) => {
      main[k] = v;
    });
    const obj: DictionaryJson = Object.assign({}, all, { main, version: "1" });
    const json = JSON.stringify(obj, null, 2);
    const attachment = new MessageAttachment(
      Buffer.from(json, "utf-8"),
      "dictionary.json"
    );
    return msg.send(
      msg.language.get(LANG_KEYS.COMMAND_EXPORT_SUCCESS),
      attachment
    );
  }
}
