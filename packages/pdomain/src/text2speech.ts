import { Readable } from "stream";
export type VoiceOptions={

}
export type Handle={

}
export interface Text2SpeechService<Opt extends VoiceOptions,Hnd extends Handle>{
    prepareVoice(text:string,options:Opt):Promise<Hnd>
    loadVoice(handle:Hnd):Promise<Readable>
    closeVoice(handle:Hnd):Promise<void>
}