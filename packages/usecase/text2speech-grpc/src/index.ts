import { Text2SpeechService } from "domain_text2speech";
import { RequestVoiceMixing, ChunkedData } from "sound-mixing-proto/index_pb";
import { IMixerClient } from "sound-mixing-proto/index_grpc_pb";
import { Readable, Transform, TransformCallback } from "stream";

import * as grpc from "grpc";
export type OpenJtalkGRPCHandle = {
  input?:grpc.ClientReadableStream<ChunkedData>;
  transformed?:Readable;
};
export type OpenJTalkGRPCOptions<VoiceKind extends string> = {
  kind: VoiceKind;
  speed: number;
  tone: number;
  volume: number;
  intone:number;
  threshold:number;
  allpass?:number|undefined;
};
export class Text2SpeechServiceOpenJtalkGRPC<VoiceKind extends string>
  implements Text2SpeechService<OpenJTalkGRPCOptions<VoiceKind>, OpenJtalkGRPCHandle> {
  constructor(private readonly client:IMixerClient){
  }
  makeHandle(): OpenJtalkGRPCHandle {
    return {};
  }
  prepareVoice(hnd: OpenJtalkGRPCHandle, text: string, options: OpenJTalkGRPCOptions<VoiceKind>): Promise<void> {
    const mixreq=new RequestVoiceMixing();
    mixreq.setAllpass(options.allpass??-1);
    mixreq.setHtsvoice(options.kind);
    mixreq.setIntone(options.intone);
    mixreq.setSpeed(options.speed);
    mixreq.setText(text);
    mixreq.setThreshold(options.threshold);
    mixreq.setTone(options.tone);
    mixreq.setVolume(options.volume);
    const stream=this.client.mixing(mixreq,{
      deadline:Infinity
    });
    hnd.input=stream;
    const transformer=new Transform({
      writableObjectMode:true,
      readableObjectMode:false,
      writableHighWaterMark:5,
      readableHighWaterMark:20480,
      autoDestroy:true,
      transform(chunk:ChunkedData|Array<ChunkedData>, encoding, done:TransformCallback) {
        console.log("transform:",chunk);
        if(Array.isArray(chunk)){
          chunk.forEach(chunk=>{
            this.push(Buffer.from(chunk.getData_asU8()));
          });
          done();
          return;
        }
        done(undefined,Buffer.from(chunk.getData_asU8()));
      },
    });
    hnd.transformed=stream.pipe(transformer);

    return Promise.resolve();
  }
  loadVoice(handle: OpenJtalkGRPCHandle): Promise<Readable | undefined> {

    console.log("loadVoice");
    return Promise.resolve(handle.transformed);
  }
  closeVoice(handle: OpenJtalkGRPCHandle): Promise<void> {
    handle.transformed?.destroy();
    handle.input?.cancel();
    handle.input?.destroy();
    return Promise.resolve();
  }
}