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
export interface Usecase {
  appliedVoiceConfig(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<AppliedVoiceConfig>;
  getUserReadName(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<string>;
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
