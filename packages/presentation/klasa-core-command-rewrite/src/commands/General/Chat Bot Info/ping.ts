import { CommandStore } from "klasa";
import { KlasaMessage } from "klasa";
import { CommandEx } from "../../../commandEx";

export default class extends CommandEx {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory);
  }

  async run(
    message: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const msg = await message.sendLocale("COMMAND_PING");
    return message.sendLocale("COMMAND_PINGPONG", [
      (msg.editedTimestamp || msg.createdTimestamp) -
        (message.editedTimestamp || message.createdTimestamp),
      Math.round(this.client.ws.ping),
    ]);
  }
}
