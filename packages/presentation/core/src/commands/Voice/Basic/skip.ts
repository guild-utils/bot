import { Command, CommandStore, KlasaMessage } from "klasa";
import { inject, autoInjectable } from "tsyringe";
import * as LANG_KEYS from "../../../lang_keys";
import Engine from "../../../text2speech/engine";
@autoInjectable()
export default class extends Command {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("engine") private readonly engine: Engine
  ) {
    super(store, file, directory, {
      usage: "",
      runIn: ["text"],
      description: (lang) => lang.get(LANG_KEYS.COMMAND_SKIP_DESCRIPTION),
    });
  }
  public async run(
    msg: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const conn = msg.guild?.voice?.connection;
    if (conn) {
      await this.engine.skip(conn);
    }
    return null;
  }
}
