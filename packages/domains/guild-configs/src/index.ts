export const languages = {
  ja_JP: "ja_JP",
};
export type BasicBotConfig = {
  prefix: string;
  language: keyof typeof languages;
  disabledCommands: Set<string>;
};
export type UpdateResult<T, U = T> = {
  type: "ok" | "same" | "error";
  before: T;
  after: U;
};
export interface BasicBotConfigRepository {
  getPrefix(guild: string): Promise<string>;
  setPrefix(guild: string, prefix: string): Promise<UpdateResult<string>>;
  getLanguage(guild: string): Promise<keyof typeof languages>;
  setLanguage(
    guild: string,
    language: keyof typeof languages
  ): Promise<UpdateResult<keyof typeof languages>>;
  getDisabledCommands(guild: string): Promise<Set<string>>;
  addDisabledCommands(
    guild: string,
    key: string
  ): Promise<UpdateResult<Set<string>>>;
  removeDisabledCommands(
    guild: string,
    key: string
  ): Promise<UpdateResult<Set<string>>>;
  get(guild: string): Promise<BasicBotConfig>;
}
export interface BasicBotConfigRepositoryCache {
  getPrefix(guild: string): string | undefined;
  getLanguage(guild: string): keyof typeof languages | undefined;
  getDisabledCommands(guild: string): Set<string> | undefined;
  get(guild: string): BasicBotConfig | undefined;
}
export interface BasicBotConfigRepositoryWithCache
  extends BasicBotConfigRepository {
  cache: BasicBotConfigRepositoryCache;
}
