import { Text2SpeechService, Handle } from "domain_core/text2speech";
import { execFile } from "child_process";
import * as fs from "fs";
import * as os from "os";
import { encodeStream } from "iconv-lite";
// prettier-ignore
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-var-requires,prettier/prettier
const uniqueFilename: (dir: string,prefix?: string) => string = require("unique-filename");
// prettier-enable
import { Readable } from "stream";

export type OpenJTalkOptions<VoiceKind extends string> = {
  kind: VoiceKind;
  speed: number;
  tone: number;
  volume: number;
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
type OpenJTalkSpownOptions = {
  x: string; //-x  dir        : dictionary directory                                    [  N/A]
  m: string; //-m  htsvoice   : HTS voice files                                         [  N/A]
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
export type OpenJTalkHandle = {
  pathToCreatedFile?: fs.PathLike;
};
export class Text2SpeechServiceOpenJtalk<VoiceKind extends string>
  implements Text2SpeechService<OpenJTalkOptions<VoiceKind>, OpenJTalkHandle> {
  constructor(
    private readonly pathtoOpenJTalk: string,
    private readonly pathToDict: string,
    private readonly mapOfKind2HtsVoice: { [k in VoiceKind]: string },
    private readonly charset: string | undefined,
    private readonly type: "OO" | "OW"
  ) {}
  async spawn(
    hnd: OpenJTalkHandle,
    opt: OpenJTalkSpownOptions,
    text: string
  ): Promise<void> {
    if (!opt.ow && this.type === "OW") {
      opt = Object.assign({}, opt, {
        ow: uniqueFilename(os.tmpdir(), "openjtalk-dst") + ".wav",
      });
    }
    if (!opt.oo && this.type === "OO") {
      opt = Object.assign({}, opt, {
        oo: uniqueFilename(os.tmpdir(), "openjtalk-dst") + ".opus",
      });
    }
    const pathToCreatedFile = opt.oo;
    const cp = execFile(
      this.pathtoOpenJTalk,
      [
        ...Object.entries(opt).flatMap(
          ([k, v]: [string, string | undefined]) => {
            return v ? [`-${k}`, `${v}`] : [];
          }
        ),
      ],
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
    hnd.pathToCreatedFile = pathToCreatedFile;
  }
  makeHandle(): Handle {
    return {};
  }
  async prepareVoice(
    hnd: OpenJTalkHandle,
    text: string,
    options: OpenJTalkOptions<VoiceKind>
  ): Promise<void> {
    await this.spawn(
      hnd,
      {
        x: this.pathToDict,
        m: this.mapOfKind2HtsVoice[options.kind],
        r: String(options.speed),
        g: String(options.volume),
        fm: String(options.tone),
      },
      text
    );
  }
  async loadVoice(handle: OpenJTalkHandle): Promise<Readable | undefined> {
    if (!handle.pathToCreatedFile) {
      throw new Error("invalid handle state");
    }
    if (
      !(await fs.promises.stat(handle.pathToCreatedFile).catch(() => false))
    ) {
      return undefined;
    }
    return fs.createReadStream(handle.pathToCreatedFile);
  }
  async closeVoice(handle: OpenJTalkHandle): Promise<void> {
    if (!handle.pathToCreatedFile) {
      return;
    }
    return await fs.promises.unlink(handle.pathToCreatedFile);
  }
}
