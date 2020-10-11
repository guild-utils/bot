import * as Domain from "domain_guild-configs";
type Languages = Domain.BasicBotConfig["language"];
export class Cache implements Domain.BasicBotConfigRepositoryCache {
  map = new Map<string, Domain.BasicBotConfig>();
  get(guild: string): Domain.BasicBotConfig | undefined {
    return this.map.get(guild);
  }
  set(guild: string, v: Domain.BasicBotConfig): void {
    this.map.set(guild, v);
  }
  getPrefix(guild: string): string | undefined {
    return this.map.get(guild)?.prefix;
  }
  setPrefix(
    guild: string,
    value: string | undefined,
    cb: (k: string) => unknown
  ): string | undefined {
    const cur = this.map.get(guild);
    const old = cur?.prefix;
    if (!cur) {
      cb(guild);
      return;
    }
    cur.prefix = value;
    return old;
  }
  getLanguage(guild: string): Languages | undefined {
    return this.map.get(guild)?.language;
  }
  setLanguage(
    guild: string,
    value: Languages,
    cb: (k: string) => unknown
  ): Languages | undefined {
    const cur = this.map.get(guild);
    const old = cur?.language;
    if (!cur) {
      cb(guild);
      return;
    }
    cur.language = value;
    return old;
  }
  getDisabledCommands(guild: string): Set<string> | undefined {
    return this.map.get(guild)?.disabledCommands;
  }
  setDisabledCommands(
    guild: string,
    value: Set<string>,
    cb: (k: string) => unknown
  ): Set<string> | undefined {
    const cur = this.map.get(guild);
    const old = cur?.disabledCommands;
    if (!cur) {
      cb(guild);
      return;
    }
    cur.disabledCommands = value;
    return old;
  }
}
export class CachedBasicConfigRepository
  implements Domain.BasicBotConfigRepositoryWithCache {
  cache: Cache;
  base: Domain.BasicBotConfigRepository;
  constructor(base: Domain.BasicBotConfigRepository) {
    this.base = base;
    this.cache = new Cache();
  }

  async getPrefix(guild: string): Promise<string | undefined> {
    return (await this.get(guild))?.prefix;
  }
  async setPrefix(
    guild: string,
    prefix: string | undefined
  ): Promise<Domain.UpdateResult<string | undefined>> {
    const res = await this.base.setPrefix(guild, prefix);
    if (res.type === "ok") {
      this.cache.setPrefix(guild, res.after, (e) =>
        this.load(e).catch(console.log)
      );
    }
    return res;
  }
  async getLanguage(guild: string): Promise<Languages> {
    return (await this.get(guild)).language;
  }
  async setLanguage(
    guild: string,
    language: Languages | undefined
  ): Promise<Domain.UpdateResult<Languages, Languages>> {
    const res = await this.base.setLanguage(guild, language);
    if (res.type === "ok") {
      this.cache.setLanguage(guild, res.after, (e) =>
        this.load(e).catch(console.log)
      );
    }
    return res;
  }
  async getDisabledCommands(guild: string): Promise<Set<string>> {
    return (await this.get(guild)).disabledCommands;
  }
  async setDisabledCommands(
    guild: string,
    key: string[]
  ): Promise<Domain.UpdateResult<Set<string>, Set<string>>> {
    const res = await this.base.setDisabledCommands(guild, key);
    if (res.type === "ok") {
      this.cache.setDisabledCommands(guild, res.after, (e) =>
        this.load(e).catch(console.log)
      );
    }
    return res;
  }
  async addDisabledCommands(
    guild: string,
    key: string
  ): Promise<Domain.UpdateResult<Set<string>, Set<string>>> {
    const res = await this.base.addDisabledCommands(guild, key);
    if (res.type === "ok") {
      this.cache.setDisabledCommands(guild, res.after, (e) =>
        this.load(e).catch(console.log)
      );
    }
    return res;
  }
  async removeDisabledCommands(
    guild: string,
    key: string
  ): Promise<Domain.UpdateResult<Set<string>, Set<string>>> {
    const res = await this.base.removeDisabledCommands(guild, key);
    if (res.type === "ok") {
      this.cache.setDisabledCommands(guild, res.after, (e) =>
        this.load(e).catch(console.log)
      );
    }
    return res;
  }
  async get(guild: string): Promise<Domain.BasicBotConfig> {
    const cv = this.cache.get(guild);
    if (cv) {
      return cv;
    }
    return await this.load(guild);
  }
  async load(guild: string): Promise<Domain.BasicBotConfig> {
    const r = await this.base.get(guild);
    this.cache.set(guild, r);
    return r;
  }
}
