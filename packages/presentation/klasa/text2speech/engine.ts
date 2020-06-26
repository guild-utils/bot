import { VoiceConnection } from "discord.js";
import {
  OpenJTalkOptions,
  OpenJTalkHandle,
  Text2SpeechServiceOpenJtalk,
} from "usecase/text2speech";
import { autoInjectable, inject } from "tsyringe";
import * as kuromoji from "kuromoji";
import { Readable } from "stream";
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
  dictionary: {
    [k in string]: {
      k: string;
      v?: string;
      p?: string;
      p1?: string;
      p2?: string;
      p3?: string;
    };
  };
  dictionaryA: [string, string?][];
  dictionaryB: [string, string?][];
  maxReadLimit: number;
};
export type Hnd = OpenJTalkHandle;
type Data = {
  hnd: Hnd;
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
  private readonly text2SpeechService: Text2SpeechServiceOpenJtalk<VoiceKind>;
  constructor(
    pathToOpenJTalk: string,
    pathToDict: string,
    private readonly mapOfKind2HtsVoice: {
      [k in VoiceKind]: { path: string; volume_fix?: number };
    },
    @inject("kuromoji")
    private readonly tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures>
  ) {
    const obj = {};
    for (const k of Object.keys(mapOfKind2HtsVoice)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      obj[k] = mapOfKind2HtsVoice[k].path;
    }
    this.text2SpeechService = new Text2SpeechServiceOpenJtalk(
      pathToOpenJTalk,
      pathToDict,
      obj,
      process.env["OPEN_JTALK_INPUT_CHARSET"]
    );
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async register(conn: VoiceConnection): Promise<void> {
    this.waitQueue.set(conn.channel.id, []);
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  private async queueRaw(conn: VoiceConnection, text: string, opt: Opt) {
    const cid = conn.channel.id;
    const hnd = this.text2SpeechService.makeHandle();
    const queue = this.waitQueue.get(cid) ?? [];
    const entry: Data = { hnd };
    this.waitQueue.set(cid, [...queue, entry]);

    entry.prepare = this.text2SpeechService.prepareVoice(hnd, text, opt);
    if (queue.length === 0) {
      this.playNext(conn).catch(console.log);
    }
  }

  async queue(conn: VoiceConnection, text: string, opt: Opt): Promise<void> {
    let sentenses = text.split("\n").join("。");
    const vf = this.mapOfKind2HtsVoice[opt.kind].volume_fix ?? 0;
    if (opt.readName) {
      sentenses = opt.readName + "。" + sentenses;
    }
    sentenses = toFullWidth(sentenses);
    for (const e of opt.dictionaryB) {
      sentenses = sentenses.split(e[0]).join(e[1]);
    }
    const arr: string[] = [];
    for (const e2 of this.tokenizer.tokenize(sentenses)) {
      const e3 = opt.dictionary[e2.surface_form];
      if (!e3) {
        arr.push(e2.surface_form);
        continue;
      }
      if (!(e2.pos === e3.p || e3.p === "*" || e3.p === undefined)) {
        arr.push(e2.surface_form);
        continue;
      }
      if (
        !(e2.pos_detail_1 === e3.p1 || e3.p1 === "*" || e3.p1 === undefined)
      ) {
        arr.push(e2.surface_form);
        continue;
      }
      if (
        !(e2.pos_detail_2 === e3.p2 || e3.p2 === "*" || e3.p2 === undefined)
      ) {
        arr.push(e2.surface_form);
        continue;
      }
      if (
        !(e2.pos_detail_3 === e3.p3 || e3.p3 === "*" || e3.p3 === undefined)
      ) {
        arr.push(e2.surface_form);

        continue;
      }
      if (e3.v) {
        arr.push(e3.v);
      }
    }
    sentenses = arr.join("");
    for (const e of opt.dictionaryA) {
      sentenses = sentenses.split(e[0]).join(e[1]);
    }
    const copy = { ...opt };
    copy.volume += vf;
    if (sentenses.length > opt.maxReadLimit) {
      sentenses = sentenses.substr(0, opt.maxReadLimit);
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
      queue[0].load = this.text2SpeechService.loadVoice(queue[0].hnd);
    }
    const stream = await queue[0].load;
    if (queue.length >= 2) {
      queue[1].load = queue[1].prepare?.then(() =>
        this.text2SpeechService.loadVoice(queue[1].hnd)
      );
    }
    if (!stream) {
      const queue2 = [...queue];
      queue2.shift();
      this.waitQueue.set(cid, queue2);
      this.playNext(conn).catch(console.log);
      return;
    }
    const dispatcher = conn.play(stream);
    dispatcher.on("finish", () => {
      const queue2 = [...(this.waitQueue.get(cid) ?? [])];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const hnd = queue2.shift()!.hnd;
      this.waitQueue.set(cid, queue2);
      this.playNext(conn).catch(console.log);
      this.text2SpeechService.closeVoice(hnd).catch(console.log);
    });
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async unregister(conn: VoiceConnection | undefined | null): Promise<void> {
    if (!conn) {
      return;
    }
    this.waitQueue.delete(conn.channel.id);
  }
}
