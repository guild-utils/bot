import { Command, CommandOptions, CommandStore } from "klasa";
export abstract class CommandEx extends Command {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    options?: CommandOptions
  ) {
    const provided = store.client.options.commandDataCollection.get(
      options?.name ?? file[file.length - 1].slice(0, -3)
    );
    super(store, file, directory, { ...provided, ...options });
  }
}
