import { CommandEx } from "presentation_klasa-core-command-rewrite";
import { CommandStore } from "klasa";
import { CommandOptions } from "klasa";
import { KlasaMessage } from "klasa";
import { META_COMMAND_DELETED } from "./lang_keys";

export class DeletedCommand extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    options: CommandOptions
  ) {
    super(store, file, directory, options);
  }
  async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | null> {
    if (!this.description) {
      return msg.sendLocale(META_COMMAND_DELETED);
    }
    if (typeof this.description === "string") {
      return msg.send(this.description);
    }
    return msg.send(this.description(msg.language));
  }
}
