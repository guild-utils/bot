import { CommandStore, KlasaMessage } from "klasa";
import { inject, autoInjectable } from "tsyringe";
import Engine from "../../../text2speech/engine";
import { CommandEx } from "presentation_klasa-core-command-rewrite";

@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("engine") private readonly engine: Engine
  ) {
    super(store, file, directory);
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
