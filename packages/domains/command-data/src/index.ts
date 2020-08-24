export interface CommandDataCollection<CommandData> {
  get(name: string): CommandData;
}
export interface CommandDataCollectionProvider<CommandData> {
  get(lang: string): CommandDataCollection<CommandData>;
  ww: CommandDataCollection<CommandData>;
}
export type CommandData = {
  receiver?: ("main" | "sub")[];
  name: string;
  guarded?: boolean;
  aliases?: string[];
  runIn?: ("text" | "dm" | "news")[];
  usage?: string;
  usageDelim?: string;
  description?: string;
  more?: string;
  cooldown?: number;
  cooldownLevel?: "author" | "channel" | "guild";
  permissionLevel?: number;
  category: string;
  subCategory?: string;
};
