import { CommandDataCollection } from "domain_command-data";
import { CommandData } from "./command-data";
export interface CommandDataCollectionProvider {
  get(lang: string): CommandDataCollection<CommandData>;
}
export class CommandDataCollectionProviderObject
  implements CommandDataCollectionProvider {
  constructor(
    private readonly source: {
      [lang in string]: CommandDataCollection<CommandData> | undefined;
    }
  ) {}
  get(lang: string): CommandDataCollection<CommandData> {
    return check(this.source[lang]);
  }
}
function check<T>(obj: T): NonNullable<T> {
  if (obj === null || obj === undefined) {
    throw new Error("Invalid Language");
  }
  return obj as NonNullable<T>;
}
