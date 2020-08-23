import { Text2SpeechService, VoiceHandle } from "domain_text2speech";
import { RequestVoiceMixing, ChunkedData } from "sound-mixing-proto/index_pb";
import { IMixerClient } from "sound-mixing-proto/index_grpc_pb";
import { Readable, Transform, TransformCallback } from "stream";

import * as grpc from "grpc";
export class OpenJtalkGRPCHandle<VoiceKind extends string>
  implements VoiceHandle {
  constructor(
    private readonly client: IMixerClient,
    public readonly options: OpenJTalkGRPCOptions<VoiceKind>
  ) {}
  prepare(text: string): Promise<void> {
    const mixreq = new RequestVoiceMixing();
    const options = this.options;
    mixreq.setAllpass(options.allpass ?? -1);
    mixreq.setHtsvoice(options.kind);
    mixreq.setIntone(options.intone);
    mixreq.setSpeed(options.speed);
    mixreq.setText(text);
    mixreq.setThreshold(options.threshold);
    mixreq.setTone(options.tone);
    mixreq.setVolume(options.volume);
    const stream = this.client.mixing(mixreq, {
      deadline: Infinity,
    });
    this.input = stream;
    this.input.on("error", (err) => {
      console.log("grpcVoiceStream:", err);
    });
    const transformer = new Transform({
      writableObjectMode: true,
      readableObjectMode: false,
      writableHighWaterMark: 5,
      readableHighWaterMark: 20480,
      autoDestroy: true,
      transform(
        chunk: ChunkedData | Array<ChunkedData>,
        encoding,
        done: TransformCallback
      ) {
        if (Array.isArray(chunk)) {
          chunk.forEach((chunk) => {
            this.push(Buffer.from(chunk.getData_asU8()));
          });
          done();
          return;
        }
        done(undefined, Buffer.from(chunk.getData_asU8()));
      },
    });
    this.transformed = stream.pipe(transformer);

    return Promise.resolve();
  }
  load(): Promise<Readable | undefined> {
    return Promise.resolve(this.transformed);
  }
  close(): Promise<void> {
    this.transformed?.destroy();
    this.input?.cancel();
    this.input?.destroy();
    return Promise.resolve();
  }
  input?: grpc.ClientReadableStream<ChunkedData>;
  transformed?: Readable;
}
export type OpenJTalkGRPCOptions<VoiceKind extends string> = {
  kind: VoiceKind;
  speed: number;
  tone: number;
  volume: number;
  intone: number;
  threshold: number;
  allpass?: number | undefined;
};
export class Text2SpeechServiceOpenJtalkGRPC<VoiceKind extends string>
  implements
    Text2SpeechService<
      OpenJTalkGRPCOptions<VoiceKind>,
      OpenJtalkGRPCHandle<VoiceKind>
    > {
  constructor(private readonly client: IMixerClient) {}
  makeHandle(
    options: OpenJTalkGRPCOptions<VoiceKind>
  ): OpenJtalkGRPCHandle<VoiceKind> {
    return new OpenJtalkGRPCHandle(this.client, options);
  }
}
