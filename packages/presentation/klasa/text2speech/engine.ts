import { VoiceConnection } from "discord.js";
import { OpenJTalkOptions, OpenJTalkHandle, Text2SpeechServiceOpenJtalk } from "usecase/text2speech";
import {  autoInjectable, inject } from "tsyringe";
import * as kuromoji from "kuromoji";
type VoiceKind="normal"|"angry"|"happy"|"neutral"|"sad"
export const VoiceKindArray=["normal","angry","happy","neutral","sad"]
export type Opt=OpenJTalkOptions<VoiceKind>&{readName?:string,dictionary:{[k in string]:{k:string,v?:string,p?:string,p1?:string,p2?:string,p3?:string}}};
export type Hnd=OpenJTalkHandle;
@autoInjectable()
export default class{
    private readonly waitQueue=new Map<string,{hnd:Hnd,p?:Promise<void>}[]>();
    private readonly text2SpeechService:Text2SpeechServiceOpenJtalk<VoiceKind>;
    constructor(
        pathToOpneJTalk:string,
        pathToDict:string,
        mapOfKind2HtsVoice:{[k in VoiceKind]:string},
        @inject("kuromoji") private readonly tokenizer:kuromoji.Tokenizer<kuromoji.IpadicFeatures>
    ){
        this.text2SpeechService=new Text2SpeechServiceOpenJtalk(pathToOpneJTalk,pathToDict,mapOfKind2HtsVoice,process.env["OPEN_JTALK_INPUT_CHARSET"]??"utf8")
    }
    async register(conn:VoiceConnection){
        this.waitQueue.set(conn.channel.id,[]);
    }
    private async queueRaw(conn:VoiceConnection,text:string,opt:Opt){
        const cid=conn.channel.id;
        const hnd=this.text2SpeechService.makeHandle();
        const queue=this.waitQueue.get(cid)??[];
        const entry:{hnd:Hnd,p?:Promise<void>}={hnd};
        this.waitQueue.set(cid,[...queue,entry]);

        entry.p=this.text2SpeechService.prepareVoice(hnd,text,opt);
        if(queue.length===0){
            this.playNext(conn)
        }
    }
    async queue(conn:VoiceConnection,text:string,opt:Opt){
        const sentenses=text.split("\n");
        if(opt.readName){
            await this.queueRaw(conn,opt.readName,opt);
        }
        for(let e of sentenses){
            const arr:string[]=[]
            for(let e2 of this.tokenizer.tokenize(e)){
                const e3=opt.dictionary[e2.surface_form];
                if(!e3){
                    arr.push(e2.surface_form);
                    continue;
                }
                if(!(e2.pos===e3.p||e3.p==="*"||e3.p===undefined)){
                    arr.push(e2.surface_form);
                    continue;
                }
                if(!(e2.pos_detail_1===e3.p1||e3.p1==="*"||e3.p1===undefined)){
                    arr.push(e2.surface_form);
                    continue;
                }
                if(!(e2.pos_detail_2===e3.p2||e3.p2==="*"||e3.p2===undefined)){
                    arr.push(e2.surface_form);
                    continue;
                }
                if(!(e2.pos_detail_3===e3.p3||e3.p3==="*"||e3.p3===undefined)){
                    arr.push(e2.surface_form);
                    
                    continue;
                }
                if(e3.v){
                    arr.push(e3.v);
                }
            }
            await this.queueRaw(conn,arr.join(""),opt)
        }
    }
    private async playNext(conn:VoiceConnection){
        const cid=conn.channel.id;
        const queue=this.waitQueue.get(cid)??[];
        if(queue.length===0){
            return;
        }
        await queue[0].p;
        const stream=await this.text2SpeechService.loadVoice(queue[0].hnd);
        if(!stream){
            const queue2=[...queue];
            queue2.shift()!;
            this.waitQueue.set(cid,queue2);
            this.playNext(conn);
            return;
        }
        const dispatcher=conn.play(stream);
        dispatcher.on("finish",async ()=>{
            const queue2=[...this.waitQueue.get(cid)??[]];
            const hnd=queue2.shift()!.hnd;
            this.waitQueue.set(cid,queue2);
            this.playNext(conn);
            this.text2SpeechService.closeVoice(hnd);
        });
    }
    async unregister(conn:VoiceConnection|undefined|null){
        if(!conn){
            return;
        }
        this.waitQueue.delete(conn.channel.id);
    }
}