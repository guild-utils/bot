import { Command, CommandStore, KlasaMessage } from "klasa";
import { DictionaryRepository } from "domain_configs";
import { autoInjectable, inject } from "tsyringe";
import * as LANG_KEYS from "../../../lang_keys";

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
      runIn: ["text"],
      usage: "",
      permissionLevel: 6,
    });
  }
  async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | null> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await this.dictionary.removeAll(msg.guild!.id);
    return msg.sendLocale(LANG_KEYS.COMMAND_CLEAR_SUCCESS);
  }
}
