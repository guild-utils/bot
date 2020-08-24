import { CommandStore } from "klasa";
import { KlasaMessage } from "klasa";
import { CommandEx } from "../../commandEx";

export default class extends CommandEx {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory);
  }

  async run(
    message: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    return message.sendLocale("COMMAND_INFO");
  }
}
