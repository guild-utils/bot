import { Readable } from "stream";
export type VoiceOptions = Record<string, unknown>;
export type Handle = Record<string, unknown>;
export interface Text2SpeechService<
  Opt extends VoiceOptions,
  Hnd extends Handle
> {
  makeHandle(): Hnd;
  prepareVoice(hnd: Hnd, text: string, options: Opt): Promise<void>;
  loadVoice(handle: Hnd): Promise<Readable | undefined>;
  closeVoice(handle: Hnd): Promise<void>;
}
