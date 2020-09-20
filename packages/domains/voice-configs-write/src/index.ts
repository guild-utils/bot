export const Randomizer = {
  v1: "v1",
  v2: "v2",
};
export const VoiceKind = {
  normal: "normal",
  angry: "angry",
  happy: "happy",
  neutral: "neutral",
  sad: "sad",
  mei_angry: "mei_angry",
  mei_bashful: "mei_bashful",
  mei_happy: "mei_happy",
  mei_normal: "mei_normal",
  mei_sad: "mei_sad",
  takumi_angry: "takumi_angry",
  takumi_happy: "takumi_happy",
  takumi_normal: "takumi_normal",
  takumi_sad: "takumi_sad",
  alpha: "alpha",
  beta: "beta",
  gamma: "gamma",
  delta: "delta",
};
export type LayeredVoiceConfig = {
  allpass: number | undefined;
  intone: number | undefined;
  speed: number | undefined;
  threshold: number | undefined;
  tone: number | undefined;
  volume: number | undefined;
  kind: keyof typeof VoiceKind | undefined;
  randomizer: keyof typeof Randomizer | undefined;
  readName: string | undefined;
};
export type UpdateResult<T, U = T> = {
  type: "ok" | "same" | "error" | "not matched";
  before?: T | undefined;
  after?: U | undefined;
};
export interface LayeredVoiceConfigRepository<LayerKeyType> {
  get(layerKey: LayerKeyType): Promise<LayeredVoiceConfig>;
  set(
    layerKey: LayerKeyType,
    newC: LayeredVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig>>;
  setAllpass(layerKey: LayerKeyType, v: number): Promise<UpdateResult<number>>;
  setIntone(layerKey: LayerKeyType, v: number): Promise<UpdateResult<number>>;
  setSpeed(layerKey: LayerKeyType, v: number): Promise<UpdateResult<number>>;
  setThreshold(
    layerKey: LayerKeyType,
    v: number
  ): Promise<UpdateResult<number>>;
  setTone(layerKey: LayerKeyType, v: number): Promise<UpdateResult<number>>;
  setVolume(layerKey: LayerKeyType, v: number): Promise<UpdateResult<number>>;
  setKind(
    layerKey: LayerKeyType,
    v: keyof typeof VoiceKind
  ): Promise<UpdateResult<keyof typeof VoiceKind>>;
  setRandomizer(
    layerKey: LayerKeyType,
    v: keyof typeof Randomizer
  ): Promise<UpdateResult<keyof typeof Randomizer>>;
  setReadName(layerKey: LayerKeyType, v: string): Promise<UpdateResult<string>>;
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
  get(guild: string): Promise<GuildVoiceConfig>;
  set(
    guild: string,
    newC: GuildVoiceConfig
  ): Promise<UpdateResult<GuildVoiceConfig>>;
  setReadName(guild: string, v: boolean): Promise<UpdateResult<boolean>>;
  setMaxReadLimit(guild: string, v: number): Promise<UpdateResult<number>>;
  setMaxVolume(guild: string, v: number): Promise<UpdateResult<number>>;
  setRandomizer(
    guild: string,
    v: keyof typeof Randomizer
  ): Promise<UpdateResult<keyof typeof Randomizer>>;
  setIfNotChanged(
    guild: string,
    newC: GuildVoiceConfig,
    comp: GuildVoiceConfig
  ): Promise<UpdateResult<GuildVoiceConfig>>;
}
