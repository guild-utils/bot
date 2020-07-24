import { VoiceConnection } from "discord.js";
import {
  OpenJTalkOptions,
  Text2SpeechServiceOpenJtalk,
} from "usecase_text2speech";
import { Text2SpeechServiceOpenJtalkGRPC } from "usecase_text2speech-grpc";
import { autoInjectable, inject } from "tsyringe";
import * as kuromoji from "kuromoji";
import { Readable } from "stream";
import { Dictionary } from "domain_configs";
import { IMixerClient } from "sound-mixing-proto/index_grpc_pb";
import { VoiceHandle } from "domain_text2speech";
export type VoiceKind =
  | "normal"
  | "angry"
  | "happy"
  | "neutral"
  | "sad"
  | "mei_angry"
  | "mei_bashful"
  | "mei_happy"
  | "mei_normal"
  | "mei_sad"
  | "takumi_angry"
  | "takumi_happy"
  | "takumi_normal"
  | "takumi_sad"
  | "alpha"
  | "beta"
  | "gamma"
  | "delta";
export const VoiceKindArray: VoiceKind[] = [
  "normal",
  "angry",
  "happy",
  "neutral",
  "sad",
  "mei_angry",
  "mei_bashful",
  "mei_happy",
  "mei_normal",
  "mei_sad",
  "takumi_angry",
  "takumi_happy",
  "takumi_normal",
  "takumi_sad",
  "alpha",
  "beta",
  "gamma",
  "delta",
];
export type Opt = OpenJTalkOptions<VoiceKind> & {
  readName?: string;
  dictionary: Dictionary;
  maxReadLimit: number;
};
export type Service = Text2SpeechServiceOpenJtalk<VoiceKind>;
export type ServiceGRPC = Text2SpeechServiceOpenJtalkGRPC<VoiceKind>;
type Data = {
  hnd: VoiceHandle;
  prepare?: Promise<void>;
  load?: Promise<Readable | undefined>;
};
function toFullWidth(elm: string) {
  return elm.replace(/[A-Za-z0-9!-~]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });
}
@autoInjectable()
export default class {
  private readonly waitQueue = new Map<string, Data[]>();
  private readonly text2SpeechService: Service;
  private readonly text2SpeechServiceGRPC: ServiceGRPC | undefined;

  private readonly type: "OO" | "OW";
  constructor(
    pathToOpenJTalk: string,
    pathToDict: string,
    private readonly mapOfKind2HtsVoice: {
      [k in VoiceKind]: { path: string; volume_fix?: number };
    },
    type: string | undefined,
    mixer: IMixerClient | undefined,
    @inject("kuromoji")
    private readonly tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>
  ) {
    const obj = {};
    for (const k of Object.keys(mapOfKind2HtsVoice) as VoiceKind[]) {
      obj[k] = mapOfKind2HtsVoice[k].path;
    }
    this.type = ["OO", "OW"].includes(type ?? "OO")
      ? ((process.env["OPEN_JTALK_OUTPUT"] ?? "OO") as "OO" | "OW")
      : "OO";
    this.text2SpeechService = new Text2SpeechServiceOpenJtalk(
      pathToOpenJTalk,
      pathToDict,
      obj,
      process.env["OPEN_JTALK_INPUT_CHARSET"],
      this.type
    );
    this.text2SpeechServiceGRPC = mixer
      ? new Text2SpeechServiceOpenJtalkGRPC(mixer)
      : undefined;
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async register(conn: VoiceConnection): Promise<void> {
    this.waitQueue.set(conn.channel.id, []);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  private async queueRaw(conn: VoiceConnection, text: string, opt: Opt) {
    const cid = conn.channel.id;
    const hnd = (
      this.text2SpeechServiceGRPC ?? this.text2SpeechService
    ).makeHandle(opt);
    const queue = this.waitQueue.get(cid) ?? [];
    const entry: Data = { hnd };
    this.waitQueue.set(cid, [...queue, entry]);

    entry.prepare = hnd.prepare(text);
    if (queue.length === 0) {
      this.playNext(conn).catch(console.log);
    }
  }

  async queue(conn: VoiceConnection, text: string, opt: Opt): Promise<void> {
    let sentenses = text.split("\n").join("。");
    const vf = this.mapOfKind2HtsVoice[opt.kind].volume_fix ?? 0;
    if (opt.readName && opt.readName != "") {
      sentenses = opt.readName + "。" + sentenses;
    }
    sentenses = toFullWidth(sentenses);
    for (const e of opt.dictionary.before) {
      sentenses = sentenses.split(e.from).join(e.to);
    }
    const arr: string[] = [];
    for (const e2 of this.tokenizer.tokenize(sentenses)) {
      const e3 = opt.dictionary.entrys.get(e2.surface_form);
      if (!e3) {
        arr.push(e2.surface_form);
        continue;
      }
      if (
        !(e2.pos === e3.p || e3.p === "*" || e3.p === "" || e3.p === undefined)
      ) {
        arr.push(e2.surface_form);
        continue;
      }
      if (
        !(
          e2.pos_detail_1 === e3.p1 ||
          e3.p1 === "*" ||
          e3.p1 === "" ||
          e3.p1 === undefined
        )
      ) {
        arr.push(e2.surface_form);
        continue;
      }
      if (
        !(
          e2.pos_detail_2 === e3.p2 ||
          e3.p2 === "*" ||
          e3.p2 === "" ||
          e3.p2 === undefined
        )
      ) {
        arr.push(e2.surface_form);
        continue;
      }
      if (
        !(
          e2.pos_detail_3 === e3.p3 ||
          e3.p3 === "*" ||
          e3.p3 === "" ||
          e3.p3 === undefined
        )
      ) {
        arr.push(e2.surface_form);

        continue;
      }
      if (e3.to) {
        arr.push(e3.to);
      }
    }
    sentenses = arr.join("");
    for (const e of opt.dictionary.after) {
      sentenses = sentenses.split(e.from).join(e.to);
    }
    const copy = { ...opt };
    copy.volume += vf;
    if (sentenses.length > opt.maxReadLimit) {
      sentenses = sentenses.substr(0, opt.maxReadLimit);
      console.log(sentenses);
    }
    await this.queueRaw(conn, sentenses, copy);
  }
  private async playNext(conn: VoiceConnection) {
    const cid = conn.channel.id;
    const queue = this.waitQueue.get(cid) ?? [];
    if (queue.length === 0) {
      return;
    }
    await queue[0].prepare;
    if (!queue[0].load) {
      queue[0].load = queue[0].hnd?.load();
    }
    const stream = await queue[0].load;
    if (queue.length >= 2) {
      const t = queue[1];
      t.load = t.prepare?.then(() => t.hnd.load());
    }
    if (!stream) {
      const queue2 = [...queue];
      queue2.shift();
      this.waitQueue.set(cid, queue2);
      this.playNext(conn).catch(console.log);
      return;
    }

    const dispatcher = conn.play(stream, {
      type: this.text2SpeechServiceGRPC
        ? "opus"
        : this.type === "OO"
        ? "ogg/opus"
        : "unknown",
    });
    dispatcher.on("finish", () => {
      const queue2 = [...(this.waitQueue.get(cid) ?? [])];
      const sf = queue2.shift();
      if (sf) {
        const hnd = sf.hnd;
        hnd.close().catch(console.log);
      }
      this.waitQueue.set(cid, queue2);
      this.playNext(conn).catch(console.log);
    });
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async unregister(conn: VoiceConnection | undefined | null): Promise<void> {
    if (!conn) {
      return;
    }
    this.waitQueue.delete(conn.channel.id);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async skip(conn: VoiceConnection): Promise<void> {
    conn.dispatcher.end();
  }
}
