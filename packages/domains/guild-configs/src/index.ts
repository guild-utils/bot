import type { UpdateResult } from "domain_meta";
export type { UpdateResult };
export const languages = {
  ja_JP: "ja_JP",
};
export type BasicBotConfig = {
  prefix: string | undefined;
  language: keyof typeof languages | undefined;
  disabledCommands: Set<string>;
};

export interface BasicBotConfigRepository {
  getPrefix(guild: string): Promise<string | undefined>;
  setPrefix(
    guild: string,
    prefix: string | undefined
  ): Promise<UpdateResult<string | undefined>>;
  getLanguage(guild: string): Promise<keyof typeof languages | undefined>;
  setLanguage(
    guild: string,
    language: keyof typeof languages | undefined
  ): Promise<UpdateResult<keyof typeof languages | undefined>>;
  getDisabledCommands(guild: string): Promise<Set<string>>;
  addDisabledCommands(
    guild: string,
    key: string
  ): Promise<UpdateResult<Set<string>>>;
  setDisabledCommands(
    guild: string,
    key: string[]
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
