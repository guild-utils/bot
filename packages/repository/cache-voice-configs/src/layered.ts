import {
  LayeredVoiceConfigRepository,
  LayeredVoiceConfig,
  UpdateResult,
  VoiceKindType,
  RandomizerTypeLayered,
} from "domain_voice-configs-write";

class CacheLayeredVoiceConfigRepositoryInternal
  implements LayeredVoiceConfigRepository<string> {
  private readonly cache = new Map<string, LayeredVoiceConfig | undefined>();
  constructor(
    private readonly upstream: LayeredVoiceConfigRepository<string>
  ) {}
  async get(layerKey: string): Promise<LayeredVoiceConfig> {
    const v = this.cache.get(layerKey);
    if (v || this.cache.has(layerKey)) {
      return Object.assign({}, v);
    }
    const r = await this.upstream.get(layerKey);
    this.cache.set(layerKey, r);
    return Object.assign({}, r);
  }
  async set(
    layerKey: string,
    newC: LayeredVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig, LayeredVoiceConfig>> {
    const r = await this.upstream.set(layerKey, newC);
    if (r.type === "ok" && r.after) {
      this.cache.set(layerKey, r.after);
    }
    return r;
  }
  async setAllpass(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    const r = await this.upstream.setAllpass(layerKey, v);
    if (r.type === "ok" && r.after) {
      const cv = await this.get(layerKey);
      this.cache.set(layerKey, Object.assign({}, cv, { allpass: r.after }));
    }
    return r;
  }
  async setIntone(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    const r = await this.upstream.setIntone(layerKey, v);
    if (r.type === "ok" && r.after) {
      const cv = await this.get(layerKey);
      this.cache.set(layerKey, Object.assign({}, cv, { intone: r.after }));
    }
    return r;
  }
  async setSpeed(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    const r = await this.upstream.setSpeed(layerKey, v);
    if (r.type === "ok") {
      const cv = await this.get(layerKey);
      this.cache.set(layerKey, Object.assign({}, cv, { speed: r.after }));
    }
    return r;
  }
  async setThreshold(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    const r = await this.upstream.setThreshold(layerKey, v);
    if (r.type === "ok") {
      const cv = await this.get(layerKey);
      this.cache.set(layerKey, Object.assign({}, cv, { threshold: r.after }));
    }
    return r;
  }
  async setTone(
    layerKey: string,
    v: number
  ): Promise<UpdateResult<number | undefined>> {
    const r = await this.upstream.setTone(layerKey, v);
    if (r.type === "ok") {
      const cv = await this.get(layerKey);
      this.cache.set(layerKey, Object.assign({}, cv, { tone: r.after }));
    }
    return r;
  }
  async setVolume(
    layerKey: string,
    v: number
  ): Promise<UpdateResult<number | undefined>> {
    const r = await this.upstream.setVolume(layerKey, v);
    if (r.type === "ok") {
      const cv = await this.get(layerKey);
      this.cache.set(layerKey, Object.assign({}, cv, { volume: r.after }));
    }
    return r;
  }
  async setKind(
    layerKey: string,
    v: VoiceKindType | undefined
  ): Promise<UpdateResult<VoiceKindType | undefined>> {
    const r = await this.upstream.setKind(layerKey, v);
    if (r.type === "ok") {
      const cv = await this.get(layerKey);
      this.cache.set(layerKey, Object.assign({}, cv, { kind: r.after }));
    }
    return r;
  }

  async setRandomizer(
    layerKey: string,
    v: RandomizerTypeLayered | undefined
  ): Promise<UpdateResult<RandomizerTypeLayered | undefined>> {
    const r = await this.upstream.setRandomizer(layerKey, v);
    if (r.type === "ok" && r.after) {
      const cv = await this.get(layerKey);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.cache.set(layerKey, Object.assign({}, cv, { randomizer: r.after }));
    }
    return r;
  }
  async setReadName(
    layerKey: string,
    v: string | undefined
  ): Promise<UpdateResult<string | undefined>> {
    const r = await this.upstream.setReadName(layerKey, v);
    if (r.type === "ok" && r.after) {
      const cv = await this.get(layerKey);
      this.cache.set(layerKey, Object.assign({}, cv, { readName: r.after }));
    }
    return r;
  }
  async setIfNotChanged(
    layerKey: string,
    newC: LayeredVoiceConfig,
    comp: LayeredVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig, LayeredVoiceConfig>> {
    const r = await this.upstream.setIfNotChanged(layerKey, newC, comp);
    if (r.type === "ok" && r.after) {
      this.cache.set(layerKey, r.after);
    }
    return r;
  }
}

export class CacheSimpleLayeredVoiceConfigRepository extends CacheLayeredVoiceConfigRepositoryInternal {}
interface CacheMemberLayeredVoiceConfigRepositoryConstructor {
  new (
    repo: LayeredVoiceConfigRepository<string>
  ): LayeredVoiceConfigRepository<[string, string]>;
}
type CacheMemberLayeredVoiceConfigRepositoryClass = {
  origin: CacheLayeredVoiceConfigRepositoryInternal;
};
export const CacheMemberLayeredVoiceConfigRepository: CacheMemberLayeredVoiceConfigRepositoryConstructor = (function (
  this: CacheMemberLayeredVoiceConfigRepositoryClass,
  upstream: LayeredVoiceConfigRepository<string>
) {
  this.origin = new CacheLayeredVoiceConfigRepositoryInternal(upstream);
} as unknown) as CacheMemberLayeredVoiceConfigRepositoryConstructor;
CacheMemberLayeredVoiceConfigRepository.prototype = Object.fromEntries(
  Object.getOwnPropertyNames(
    CacheLayeredVoiceConfigRepositoryInternal.prototype
  ).map((name) => {
    return [
      name,
      function (
        this: CacheMemberLayeredVoiceConfigRepositoryClass,
        k: string[],
        ...args: unknown[]
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
        return this.origin[name](k.join("."), ...args);
      },
    ];
  })
);
