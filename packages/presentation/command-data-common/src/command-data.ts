import { CommandDataCollection } from "domain_command-data";

export type CommandData = {
  receiver?: ("main" | "sub")[];
  name: string;
  aliases?: string[];
  runIn?: ("text" | "dm" | "news")[];
  usage?: string;
  usageDelim?: string;
  guarded?: boolean;
  description?: string;
  cooldown?: number;
  cooldownLevel?: "author" | "channel" | "guild";
  permissionLevel?: number;
  more?: string;
};
export class CommandDataCollectionObject
  implements CommandDataCollection<CommandData> {
  private readonly source: { [nameOrAlias in string]: CommandData | undefined };
  constructor(source: CommandData[]) {
    this.source = {};
    for (const entry of source) {
      for (const k of [entry.name, ...(entry.aliases ?? [])]) {
        if (this.source[k]) {
          throw new Error(`${k} is duplicate.`);
        }
        this.source[k] = entry;
      }
    }
  }
  get(command: string): CommandData {
    return check(this.source[command]);
  }
}
function check<T>(obj: T): NonNullable<T> {
  if (obj === null || obj === undefined) {
    throw new Error("Invalid command");
  }
  return obj as NonNullable<T>;
}
