import {  Metadata } from "schedule";
import { TaskStore, Settings, Task } from "klasa";
import { noticeChannel, googleSpreadSheetId, nextTaskId } from "../settings";
import * as moment from 'moment'
import { GameEvent, GameEventNotifyRepository, GameEventCollection, HKTCollectionName } from "pdomain/game-event";
import { TextChannel } from "discord.js";
import { GameEventUseCase } from "usecase/game-event";
import { inject, autoInjectable } from "tsyringe";
export const taskName="event-notice";
@autoInjectable()
export default class extends Task {

    constructor(
        store: TaskStore, 
        file: string[], 
        directory: string,
        @inject("GameEventUseCase") private gameEvent:GameEventUseCase,
        @inject("GameEventNotifyRepository") private notifyRepo:GameEventNotifyRepository
    ){
        super(store,file,directory,{name:taskName, enabled: true});

    }
    async run(meta:Metadata):Promise<void>{
        console.log("task run");
        const guild=this.client.guilds.resolve(meta.guildId);
        if(!guild){
            return;
        }
        guild.settings.update(nextTaskId.join("."),null)
        const g=this.client.guilds.resolve(meta.guildId);
        if(!g){
            this.client.emit("wtf","guild is falty");
            return;
        }
        await this.notice(g.settings,meta);
    }
    async notice(guildSettings: Settings,meta:Metadata):Promise<void>{
        const channelId=guildSettings.get(noticeChannel)
        const channel=this.client.channels.resolve(channelId)
        if(!(channel instanceof TextChannel)){
            return;
        }
        const gid=guildSettings.get(googleSpreadSheetId)
        const arr=await this.gameEvent.nextEvents(gid,meta.time);
        const now=moment();
        const target:[GameEventCollection<HKTCollectionName>,GameEvent,moment.Moment ][]=[];
        const promise:Promise<unknown>[]=[];
        for(let i=0;i<arr.length&&arr[i][2].isSameOrBefore(now)&&arr[i][1].lastNotice.isBefore(meta.time);++i){
            target.push(arr[i]);
            promise.push(this.gameEvent.updateLastNoticeTime(gid,arr[i][0].name.name,arr[i][1],now));
        }
        await Promise.all([...promise,...(target.map(e=>this.send(channel,e[1],e[2],now)))]);
        await this.notifyRepo.register(meta.guildId,(await this.gameEvent.allEvents(gid)).map(e=>e[1]));
    }
    async send(channel:TextChannel,event:GameEvent, t:moment.Moment,now:moment.Moment){
        channel.sendMessage(
            [
                `**${event.name}** starts in **${t.diff(now,"minutes")}** minutes`,
                ...[...event.header].filter(e=>e!=="name").map(e=>`${e}:${event.desc[e]}`)
            ].join("\n")
        );
    }
}