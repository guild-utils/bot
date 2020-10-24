import { BasicBotConfigRepository } from "domain_guild-configs";

export function getLang(
  repo: BasicBotConfigRepository,
  defaultLang: string
): getLangType {
  return async (guild?: string) => {
    return (guild ? await repo.getLanguage(guild) : defaultLang) ?? defaultLang;
  };
}
export type getLangType = (guild?: string) => Promise<string>;
