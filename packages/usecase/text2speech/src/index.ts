import { Text2SpeechService, VoiceHandle } from "domain_text2speech";
import { execFile } from "child_process";
import * as fs from "fs";
import * as os from "os";
import { encodeStream } from "iconv-lite";
// prettier-ignore
import uniqueFilename =require("unique-filename");
// prettier-enable
import { Readable } from "stream";

export type OpenJTalkOptions<VoiceKind extends string> = {
  kind: VoiceKind;
  speed: number;
  tone: number;
  volume: number;
  intone:number;
  threshold:number;
  allpass?:number|undefined;
};
/**
 *     -x  dir        : dictionary directory                                    [  N/A]
    -m  htsvoice   : HTS voice files                                         [  N/A]
    -ow s          : filename of output wav audio (generated speech)         [  N/A]
    -ot s          : filename of output trace information                    [  N/A]
    -s  i          : sampling frequency                                      [ auto][   1--    ]
    -p  i          : frame period (point)                                    [ auto][   1--    ]
    -a  f          : all-pass constant                                       [ auto][ 0.0-- 1.0]
    -b  f          : postfiltering coefficient                               [  0.0][ 0.0-- 1.0]
    -r  f          : speech speed rate                                       [  1.0][ 0.0--    ]
    -fm f          : additional half-tone                                    [  0.0][    --    ]
    -u  f          : voiced/unvoiced threshold                               [  0.5][ 0.0-- 1.0]
    -jm f          : weight of GV for spectrum                               [  1.0][ 0.0--    ]
    -jf f          : weight of GV for log F0                                 [  1.0][ 0.0--    ]
    -g  f          : volume (dB)                                             [  0.0][    --    ]
    -z  i          : audio buffer size (if i==0, turn off)                   [    0][   0--    ]
 */
type OpenJTalkSpawnOptions = {
  x: string;
  m: string;
  ow?: string;
  oo?: string;
  ot?: string;
  s?: string;
  p?: string;
  a?: string;
  b?: string;
  r?: string;
  fm?: string;
  u?: string;
  jm?: string;
  jf?: string;
  g?: string;
  z?: string;
};
export class OpenJTalkHandle<VoiceKind extends string> implements VoiceHandle {
  constructor(    private readonly pathtoOpenJTalk: string,
    private readonly pathToDict: string,
    private readonly mapOfKind2HtsVoice: { [k in VoiceKind]: string },
    private readonly charset: string | undefined,
    private readonly type: "OO" | "OW",
    private readonly options:OpenJTalkOptions<VoiceKind>){

  }
  private async spawn(opt: OpenJTalkSpawnOptions,text:string){
    if (!opt.ow && this.type === "OW") {
      opt = Object.assign({}, opt, {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-unsafe-call
        ow: uniqueFilename(os.tmpdir(), "openjtalk-dst") + ".wav",
      });
    }
    if (!opt.oo && this.type === "OO") {
      opt = Object.assign({}, opt, {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-unsafe-call
        oo: uniqueFilename(os.tmpdir(), "openjtalk-dst") + ".opus",
      });
    }
    const pathToCreatedFile = opt.oo;
    const args=[
      ...Object.entries(opt).flatMap(
        ([k, v]: [string, string | undefined]) => {
          return v ? [`-${k}`, `${v}`] : [];
        }
      ),
    ];
    const cp = execFile(
      this.pathtoOpenJTalk,
      args,
      (error, stdout, stderr) => {
        if (error) {
          console.log(error);
        }
        console.log(stdout);
        console.log(stderr);
      }
    );
    if (this.charset) {
      const conv = encodeStream(this.charset);
      conv.on("error", (...args) => {
        console.log(args);
      });
      if (!cp.stdin) {
        throw TypeError("stdin is closed");
      }
      conv.pipe(cp.stdin);
      conv.write(text);
      conv.end();
    } else {
      cp.stdin?.write(text);
    }
    cp.stdin?.end();
    cp.stdin?.on("error", (err) => {
      console.log(err);
    });
    await new Promise((resolve) =>
      cp.on("exit", (code) => {
        const c = code ?? 0;
        if (c === 0) {
          resolve(c);
          return;
        }
        console.log(`OpenJTalk exited with ${c}`);
        resolve(undefined);
      })
    );
    this.pathToCreatedFile = pathToCreatedFile;
  }
  async prepare(text: string): Promise<void> {
    const options=this.options;
    await this.spawn(
      {
        x: this.pathToDict,
        m: this.mapOfKind2HtsVoice[options.kind],
        r: String(options.speed),
        g: String(options.volume),
        fm: String(options.tone),
        u: String(options.threshold),
        a: options.allpass?String(options.allpass):undefined ,
        jf: String(options.intone)
      },
      text
    );
  }
  async load(): Promise<Readable | undefined> {
    if (!this.pathToCreatedFile) {
      throw new Error("invalid handle state");
    }
    if (
      !(await fs.promises.stat(this.pathToCreatedFile).catch(() => false))
    ) {
      return undefined;
    }
    return fs.createReadStream(this.pathToCreatedFile);  
  }
  async close(): Promise<void> {
    if (!this.pathToCreatedFile) {
      return;
    }
    return await fs.promises.unlink(this.pathToCreatedFile);
  }
  pathToCreatedFile?: fs.PathLike;
};
export class Text2SpeechServiceOpenJtalk<VoiceKind extends string>
  implements Text2SpeechService<OpenJTalkOptions<VoiceKind>, OpenJTalkHandle<VoiceKind>> {
  constructor(
    private readonly pathtoOpenJTalk: string,
    private readonly pathToDict: string,
    private readonly mapOfKind2HtsVoice: { [k in VoiceKind]: string },
    private readonly charset: string | undefined,
    private readonly type: "OO" | "OW"
  ) {}
  makeHandle(opt:OpenJTalkOptions<VoiceKind>):OpenJTalkHandle<VoiceKind>{
    return new OpenJTalkHandle(this.pathtoOpenJTalk,this.pathToDict,this.mapOfKind2HtsVoice,this.charset,this.type,opt);
  }
}
