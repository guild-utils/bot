import { Readable } from "stream";
export type VoiceOptions = Record<string, unknown>;
export interface VoiceHandle{
  prepare(text: string):Promise<void>;
  load(): Promise<Readable | undefined>;
  close(): Promise<void>;
}
export interface Text2SpeechService<
  Opt extends VoiceOptions,
  Hnd extends VoiceHandle
> {
  makeHandle(options: Opt): Hnd;
}
