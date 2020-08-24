import { Command, CommandOptions, CommandStore } from "klasa";
import { CommandData } from "presentation_command-data-common";
export abstract class CommandEx extends Command {
  public metadata: CommandData;
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    options?: CommandOptions
  ) {
    const name = options?.name ?? file[file.length - 1].slice(0, -3);
    const metadata = store.client.options.allCommands["ww"].find(
      (e) => e.name === name
    );
    if (!metadata) {
      throw new Error("Metadata not found!");
    }
    super(store, file, directory, { ...metadata, ...options });
    this.metadata = metadata;
  }
}
