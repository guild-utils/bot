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
  intone: number;
  speed: number;
  threshold: number;
  tone: number;
  volume: number;
  kind: keyof typeof VoiceKind;
  randomizer: keyof typeof Randomizer;
  readName: string;
};
export type UpdateResult<T, U = T> = {
  type: "ok" | "same" | "error";
  before: T;
  after: U;
};
export interface LayeredVoiceConfigRepository {
  get(layerKey: string): LayeredVoiceConfig;
  set(
    layerKey: string,
    newC: LayeredVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig>>;
  setAllpass(layerKey: string, v: number): Promise<UpdateResult<number>>;
  setIntone(layerKey: string, v: number): Promise<UpdateResult<number>>;
  setSpeed(layerKey: string, v: number): Promise<UpdateResult<number>>;
  setThreshold(layerKey: string, v: number): Promise<UpdateResult<number>>;
  setTone(layerKey: string, v: number): Promise<UpdateResult<number>>;
  setVolume(layerKey: string, v: number): Promise<UpdateResult<number>>;
  setKind(
    layerKey: string,
    v: keyof typeof VoiceKind
  ): Promise<UpdateResult<keyof typeof VoiceKind>>;
  setRandomizer(
    layerKey: string,
    v: keyof typeof Randomizer
  ): Promise<UpdateResult<keyof typeof Randomizer>>;
  setReadName(layerKey: string, v: string): Promise<string>;
  setIfNotChanged(
    layerKey: string,
    newC: LayeredVoiceConfig,
    comp: LayeredVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig>>;
}
export type GuildVoiceConfig = {
  readName: boolean;
  maxReadLimit: number;
  randomizer: keyof typeof Randomizer;
};
export interface GuildVoiceConfigRepository {
  get(guild: string): GuildVoiceConfig;
  set(
    guild: string,
    newC: GuildVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig>>;
  setReadName(guild: string, v: boolean): Promise<UpdateResult<boolean>>;
  setMaxReadLimit(guild: string, v: number): Promise<UpdateResult<string>>;
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
