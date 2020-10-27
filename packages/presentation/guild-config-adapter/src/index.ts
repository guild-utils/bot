/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BasicBotConfigRepositoryWithCache } from "domain_guild-configs";
export default class {
  constructor(private readonly base: BasicBotConfigRepositoryWithCache) {}
  getPrefix(guild: string): string {
    return this.base.cache.getPrefix(guild)!;
  }
  getDisabledCommands(guild: string): Set<string> {
    return this.base.cache.getDisabledCommands(guild)!;
  }
  getLanguage(guild: string): string {
    return this.base.cache.getLanguage(guild)!;
  }
}
