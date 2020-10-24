export type DictionaryEntryA = {
  to: string;
  p?: string;
  p1?: string;
  p2?: string;
  p3?: string;
};
export type DictionaryEntryB = {
  from: string;
  to: string;
};
export type Dictionary = {
  before: DictionaryEntryB[];
  main: Map<string, DictionaryEntryA>;
  after: DictionaryEntryB[];
};

export type AppliedVoiceConfig = {
  dictionary: Dictionary;
  kind: string;
  readName?: string;
  speed: number;
  tone: number;
  volume: number;
  maxReadLimit: number;
  allpass: number | undefined;
  intone: number;
  threshold: number;
};
type Entry<T> = {
  value: T;
  provider: string;
};
export type AppliedVoiceConfigResolvedBy = {
  dictionary: Entry<Dictionary>;
  kind: Entry<string>;
  readName: Entry<string | undefined>;
  speed: Entry<number>;
  tone: Entry<number>;
  volume: Entry<number>;
  maxReadLimit: Entry<number>;
  allpass: Entry<number | undefined>;
  intone: Entry<number>;
  threshold: Entry<number>;
};
export interface Usecase {
  appliedVoiceConfig(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<AppliedVoiceConfig>;
  appliedVoiceConfigResolvedBy(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<AppliedVoiceConfigResolvedBy>;
  getUserReadName(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<string>;
  getUserReadNameResolvedBy(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<[string, string]>;
}
export interface DictionaryRepository {
  getAll(guild: string): Promise<Dictionary>;
  getBefore(guild: string): Promise<DictionaryEntryB[]>;
  getMain(guild: string): Promise<Map<string, DictionaryEntryA>>;
  getAfter(guild: string): Promise<DictionaryEntryB[]>;
  removeAll(guild: string): Promise<void>;
  removeBefore(
    guild: string,
    key: number
  ): Promise<DictionaryEntryB | undefined>;
  removeMain(guild: string, key: string): Promise<DictionaryEntryA | undefined>;
  removeAfter(
    guild: string,
    key: number
  ): Promise<DictionaryEntryB | undefined>;
  updateBefore(
    guild: string,
    key: number,
    entry: DictionaryEntryB | string
  ): Promise<[DictionaryEntryB, DictionaryEntryB] | undefined>;
  updateMain(
    guild: string,
    key: string,
    entry: DictionaryEntryA
  ): Promise<[DictionaryEntryA | undefined, DictionaryEntryA]>;
  updateAfter(
    guild: string,
    key: number,
    entry: DictionaryEntryB | string
  ): Promise<[DictionaryEntryB, DictionaryEntryB] | undefined>;
  appendBefore(
    guild: string,
    entry: DictionaryEntryB,
    pos?: number
  ): Promise<DictionaryEntryB>;
  appendAfter(
    guild: string,
    entry: DictionaryEntryB,
    pos?: number
  ): Promise<DictionaryEntryB>;
}
