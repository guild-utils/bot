import { Readable } from "stream";
export type VoiceOptions = Record<string, unknown>;
export interface VoiceHandle {
  prepare(text: string): Promise<void>;
  load(): Promise<Readable | undefined>;
  close(): Promise<void>;
}
export interface Text2SpeechService<
  Opt extends VoiceOptions,
  Hnd extends VoiceHandle
> {
  makeHandle(options: Opt): Hnd;
}
export type AnalysisDictionaryEntry = {
  v?: string;
  p?: string;
  p1?: string;
  p2?: string;
  p3?: string;
};
export type AnalysisDictionary = {
  [k in string]: AnalysisDictionaryEntry;
};
export type SimpleDictionaryEntry = [string, string];
export type SimpleDictionary = SimpleDictionaryEntry[];

export interface DictionaryRepository {
  getBefore(): Promise<SimpleDictionary>;
  getMain(): Promise<AnalysisDictionary>;
  getAfter(): Promise<SimpleDictionary>;
}
