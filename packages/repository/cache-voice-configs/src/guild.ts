import {
  GuildVoiceConfigRepository,
  GuildVoiceConfig,
  UpdateResult,
  RandomizerTypeGuild,
} from "domain_voice-configs-write";

export class CacheGuildVoiceConfigRepository
  implements GuildVoiceConfigRepository {
  private readonly cache = new Map<string, GuildVoiceConfig | undefined>();
  constructor(private readonly upstream: GuildVoiceConfigRepository) {}
  async set(
    guild: string,
    newC: GuildVoiceConfig
  ): Promise<UpdateResult<GuildVoiceConfig, GuildVoiceConfig>> {
    const r = await this.upstream.set(guild, newC);
    if (r.type === "ok" && r.after) {
      this.cache.set(guild, Object.assign({}, r.after));
    }
    return r;
  }
  async get(guild: string): Promise<GuildVoiceConfig> {
    const v = this.cache.get(guild);
    if (v || this.cache.has(guild)) {
      return Object.assign({}, v);
    }
    const rv = await this.upstream.get(guild);
    this.cache.set(guild, rv);
    return Object.assign({}, rv);
  }
  async setReadName(
    guild: string,
    v: boolean | undefined
  ): Promise<UpdateResult<boolean | undefined>> {
    const r = await this.upstream.setReadName(guild, v);
    if (r.type === "ok" && r.after) {
      const cv = this.cache.get(guild);
      this.cache.set(guild, Object.assign({}, cv, { readName: r.after }));
    }
    return r;
  }
  async setMaxReadLimit(
    guild: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    const r = await this.upstream.setMaxReadLimit(guild, v);
    if (r.type === "ok" && r.after) {
      const cv = this.cache.get(guild);
      this.cache.set(guild, Object.assign({}, cv, { maxReadLimit: r.after }));
    }
    return r;
  }
  async setMaxVolume(
    guild: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    const r = await this.upstream.setMaxVolume(guild, v);
    if (r.type === "ok" && r.after) {
      const cv = this.cache.get(guild);
      this.cache.set(guild, Object.assign({}, cv, { maxVolume: r.after }));
    }
    return r;
  }
  async setRandomizer(
    guild: string,
    v: RandomizerTypeGuild | undefined
  ): Promise<UpdateResult<RandomizerTypeGuild | undefined>> {
    const r = await this.upstream.setRandomizer(guild, v);
    if (r.type === "ok" && r.after) {
      const cv = this.cache.get(guild);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.cache.set(guild, Object.assign({}, cv, { randomizer: r.after }));
    }
    return r;
  }
  async setIfNotChanged(
    guild: string,
    newC: GuildVoiceConfig,
    comp: GuildVoiceConfig
  ): Promise<UpdateResult<GuildVoiceConfig, GuildVoiceConfig>> {
    const r = await this.upstream.setIfNotChanged(guild, newC, comp);
    if (r.type === "ok" && r.after) {
      this.cache.set(guild, Object.assign({}, r.after));
    }
    return r;
  }
}
