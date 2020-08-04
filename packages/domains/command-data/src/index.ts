export interface CommandDataCollection<CommandData> {
  get(name: string): CommandData;
}
export interface CommandDataCollectionProvider<CommandData> {
  get(lang: string): CommandDataCollection<CommandData>;
  ww: CommandDataCollection<CommandData>;
}
