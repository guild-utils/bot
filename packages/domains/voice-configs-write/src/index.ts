import type { UpdateResult, VoiceKindType } from "domain_meta";
export type { UpdateResult, VoiceKindType };
export const Randomizer = {
  v1: "v1",
  v2: "v2",
};

export type LayeredVoiceConfig = {
  allpass: number | undefined;
  intone: number | undefined;
  speed: number | undefined;
  threshold: number | undefined;
  tone: number | undefined;
  volume: number | undefined;
  kind: VoiceKindType | undefined;
  randomizer: keyof typeof Randomizer | undefined;
  readName: string | undefined;
};

export interface LayeredVoiceConfigRepository<LayerKeyType> {
  get(layerKey: LayerKeyType): Promise<LayeredVoiceConfig | undefined>;
  set(
    layerKey: LayerKeyType,
    newC: LayeredVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig>>;
  setAllpass(
    layerKey: LayerKeyType,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>>;
  setIntone(
    layerKey: LayerKeyType,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>>;
  setSpeed(
    layerKey: LayerKeyType,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>>;
  setThreshold(
    layerKey: LayerKeyType,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>>;
  setTone(
    layerKey: LayerKeyType,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>>;
  setVolume(
    layerKey: LayerKeyType,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>>;
  setKind(
    layerKey: LayerKeyType,
    v: VoiceKindType | undefined
  ): Promise<UpdateResult<VoiceKindType | undefined>>;
  setRandomizer(
    layerKey: LayerKeyType,
    v: keyof typeof Randomizer | undefined
  ): Promise<UpdateResult<keyof typeof Randomizer | undefined>>;
  setReadName(
    layerKey: LayerKeyType,
    v: string | undefined
  ): Promise<UpdateResult<string | undefined>>;
  setIfNotChanged(
    layerKey: LayerKeyType,
    newC: LayeredVoiceConfig,
    comp: LayeredVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig>>;
}
export type GuildVoiceConfig = {
  readName?: boolean;
  maxReadLimit?: number;
  maxVolume?: number;
  randomizer?: keyof typeof Randomizer;
};
export interface GuildVoiceConfigRepository {
  get(guild: string): Promise<GuildVoiceConfig | undefined>;
  set(
    guild: string,
    newC: GuildVoiceConfig
  ): Promise<UpdateResult<GuildVoiceConfig>>;
  setReadName(
    guild: string,
    v: boolean | undefined
  ): Promise<UpdateResult<boolean | undefined>>;
  setMaxReadLimit(
    guild: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>>;
  setMaxVolume(
    guild: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>>;
  setRandomizer(
    guild: string,
    v: keyof typeof Randomizer | undefined
  ): Promise<UpdateResult<keyof typeof Randomizer | undefined>>;
  setIfNotChanged(
    guild: string,
    newC: GuildVoiceConfig,
    comp: GuildVoiceConfig
  ): Promise<UpdateResult<GuildVoiceConfig>>;
}
