import { Text2SpeechService } from "pdomain/text2speech";
import { execFile } from "child_process";
import * as fs from "fs";
import * as os from "os";
import { encodeStream } from "iconv-lite";
const uniqueFilename =require("unique-filename");
import { Readable } from "stream";

export type OpenJTalkOptions<VoiceKind extends string>={
    kind:VoiceKind
    speed:number
    tone:number
    volume:number
}
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
type OpenJTalkSpownOptions={
    x:string,//-x  dir        : dictionary directory                                    [  N/A]
    m:string, //-m  htsvoice   : HTS voice files                                         [  N/A]
    ow?:string,
    ot?:string,
    s?:string,
    p?:string,
    a?:string,
    b?:string,
    r?:string,
    fm?:string,
    u?:string,
    jm?:string,
    jf?:string,
    g?:string,
    z?:string
}
export type OpenJTalkHandle={
    pathToCreatedFile:fs.PathLike
}
export class Text2SpeechServiceOpenJtalk<VoiceKind extends string> implements Text2SpeechService<OpenJTalkOptions<VoiceKind>,OpenJTalkHandle>{
    constructor(private readonly pathtoOpenJTalk:string,private readonly pathToDict:string,private readonly mapOfKind2HtsVoice:{[k in VoiceKind]:string},private readonly charset:string){

    }
    async spawn(opt:OpenJTalkSpownOptions,text:string):Promise<OpenJTalkHandle>{
        if(!opt.ow){
           opt=Object.assign({},opt,{ow:uniqueFilename(os.tmpdir(),"openjtalk-dst")})
        }
        const ow=opt.ow;
        const cp= execFile(this.pathtoOpenJTalk,[...Object.keys(opt).flatMap(k=>[`-${k}`,`${opt[k]}`])],(error,stdout,stderr)=>{
            console.log(stdout);
            console.log(stderr);
            if(error){
                throw error;
            }
        });
        const conv=encodeStream(this.charset);
        conv.on("error",(...args)=>{
            console.log(args)
        });
        conv.pipe(cp.stdin!);
        conv.write(text);
        conv.end();
        cp.stdin?.end();
        cp.stdin?.on("error",(err)=>{
            console.log(err)
        })
        await new Promise((resolve,reject)=>cp.on("exit",(code,signal)=>{
            if(code===0){
                resolve(code);
                return;
            }
            reject(new Error(`OpenJTalk exited with ${code}`));
        }));
        return {pathToCreatedFile:ow!};
    }
    async prepareVoice(text: string, options: OpenJTalkOptions<VoiceKind>): Promise<OpenJTalkHandle>{
        return this.spawn({x:this.pathToDict,m:this.mapOfKind2HtsVoice[options.kind],r:String(options.speed),g:String(options.volume),fm:String(options.tone)},text);
    }
    async loadVoice(handle: OpenJTalkHandle): Promise<Readable>{
        return fs.createReadStream(handle.pathToCreatedFile);

    }
    async closeVoice(handle:OpenJTalkHandle){
        return fs.promises.unlink(handle.pathToCreatedFile);
    }
}