import { VoiceConnection } from "discord.js";
import { OpenJTalkOptions, OpenJTalkHandle, Text2SpeechServiceOpenJtalk } from "usecase/text2speech";
import {  autoInjectable } from "tsyringe";
export type Opt=OpenJTalkOptions<"normal">;
export type Hnd=OpenJTalkHandle;
@autoInjectable()
export default class{
    private readonly waitQueue=new Map<string,Hnd[]>();
    private readonly text2SpeechService:Text2SpeechServiceOpenJtalk<"normal">;
    constructor(
        pathToOpneJTalk:string,
        pathToDict:string,
        mapOfKind2HtsVoice:{normal:string}
    ){
        this.text2SpeechService=new Text2SpeechServiceOpenJtalk(pathToOpneJTalk,pathToDict,mapOfKind2HtsVoice)
    }
    async register(conn:VoiceConnection){
        this.waitQueue.set(conn.channel.id,[]);
    }
    async queue(conn:VoiceConnection,text:string,opt:Opt){
       const hnd=await this.text2SpeechService.prepareVoice(text,opt);
       const cid=conn.channel.id;
       const queue=this.waitQueue.get(cid)??[];
       this.waitQueue.set(cid,[...queue,hnd]);
       if(queue.length===0){
           await this.playNext(conn)
       }
    }
    private async playNext(conn:VoiceConnection){
        const cid=conn.channel.id;
        const queue=this.waitQueue.get(cid)??[];
        if(queue.length===0){
            return;
        }
        const dispatcher=conn.play(await this.text2SpeechService.loadVoice(queue[0]));
        dispatcher.on("finish",async ()=>{
            const queue2=[...this.waitQueue.get(cid)??[]];
            const hnd=queue2.shift()!;
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