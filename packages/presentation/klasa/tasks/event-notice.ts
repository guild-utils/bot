import {  Metadata } from "schedule";
import { TaskStore, Settings, Task } from "klasa";
import { noticeChannel, googleSpreadSheetId } from "../settings";
import * as moment from 'moment'
import { GameEvent } from "pdomain/game-event";
import { TextChannel } from "discord.js";
import { GameEventUseCase } from "usecase/game-event";
import { inject, autoInjectable } from "tsyringe";
export const taskName="event-notice";
@autoInjectable()
export default class extends Task {

    constructor(store: TaskStore, file: string[], directory: string,@inject("GameEventUseCase") private gameEvent:GameEventUseCase){
        super(store,file,directory,{name:taskName, enabled: true});

    }
    async run(meta:Metadata):Promise<void>{
        console.trace()
        console.log("task run")
        const g=this.client.guilds.resolve(meta.guildId);
        if(!g){
            this.client.emit("wtf","guild is falty")
            return
        }
        await this.notice(g.settings,meta)
    }
    async notice(guildSettings: Settings,meta:Metadata):Promise<void>{
        const channelId=guildSettings.get(noticeChannel)
        const channel=this.client.channels.resolve(channelId)
        if(!(channel instanceof TextChannel)){
            return
        }
        const arr=await this.gameEvent.nextEvents(guildSettings.get(googleSpreadSheetId),meta.time);
        const now=moment()
        const target:[GameEvent,moment.Moment ][]=[]
        for(let i=0;i<arr.length&&arr[i][1].isSameOrBefore(now);++i){
            target.push(arr[i])
        }
        await Promise.all(target.map(e=>this.send(channel,e[0],e[1],now)))
    }
    async send(channel:TextChannel,event:GameEvent, t:moment.Moment,now:moment.Moment){
        channel.sendMessage([`**${event.name}** starts in **${t.diff(now,"minutes")}** minutes`,...[...event.header].filter(e=>e!=="name").map(e=>{
            if(e!=="name"){
                return
            }
            return `${e}:${event.desc[e]}`
        })].join("\n"))
    }
}