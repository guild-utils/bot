import { GameEventNotificationRepository,GameEvent,nextNoticeTime } from "pdomain/game-event";
import * as moment from "moment-timezone";

import {  KlasaClient } from "klasa";

export class GameEventNotificationRepositoryKlasa implements GameEventNotificationRepository{
    private client!:KlasaClient
    constructor(private taskName:string,private nextTaskId:string[]){

    }
    async register(guildId:string,event:GameEvent[]):Promise<void>{
        const sc=this.client.schedule
        const guild=this.client.guilds.resolve(guildId);
        if(!guild){
            return;
        }
        const settings=guild.settings;

        const taskId=settings.get(this.nextTaskId);
        const bt=taskId?sc.get(taskId):null;
        const now=moment.utc();
        const newt=event.map((e):[GameEvent,moment.Moment|undefined]=>[e,nextNoticeTime(e,now)]).filter((e:[GameEvent,moment.Moment|undefined])=>e[1]!==undefined&&e[0].lastNotice.isBefore(e[1])).sort(([ae,at],[be,bt])=>at!.diff(bt))[0];
        if(newt===undefined){
            return;
        }
        if(!bt){
            const nt=await sc.create(this.taskName,newt[1]!.toDate(),{
                data:{
                    guildId:guildId,
                    time:newt[1]
                }
            });
            settings.update(this.nextTaskId.join("."),nt.id);
            return;
        }
        const btt=moment(bt.time.getTime());
        if(btt.isBefore(newt[1])){
            return;
        }
        await bt.delete();
        const nt=await sc.create(this.taskName,newt[1]!.toDate(),{
            data:{
                guildId:guildId,
                time:newt[1]
            }
        });
        await settings.update(this.nextTaskId.join("."),nt.id);

    }
    init(client:KlasaClient){
        this.client=client;
    }
}