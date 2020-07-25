export type DictionaryEntryB = {
  from: string;
  to: string;
};
export type DictionaryEntryA = {
  to: string;
  p?: string;
  p1?: string;
  p2?: string;
  p3?: string;
};
export type DictionaryJson = {
  version: string | "1";
  before: DictionaryEntryB[];
  main: Record<string, DictionaryEntryA>;
  after: DictionaryEntryB[];
};
