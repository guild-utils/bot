import { GameEventNotifyRepository,GameEvent,nextTiming } from "pdomain/game-event";
import * as moment from "moment";
import { Schedule } from "klasa";

export class GameEventNotifyRepositoryKlasa implements GameEventNotifyRepository{
    private schedule!:Schedule
    constructor(private taskName:string){

    }
    async register(guildId:string,event:GameEvent[]):Promise<void>{
        const sc=this.schedule
        const bt=sc.get(`${guildId}.event.notify`)
        const now=moment()
        const newt=event.map((e):[GameEvent,moment.Moment]=>[e,nextTiming(e,now)]).sort(([ae,at],[be,bt])=>at.diff(bt))[0]
        if(!bt){
            await sc.create(this.taskName,newt[1].toDate(),{
                id:`${guildId}.event.notify`,
                data:{
                    guildId:guildId,
                    time:newt[1]
                }
            });
            return
        }
        const btt=moment(bt.time.getTime())
        if(btt.isBefore(newt[1])){
            return
        }
        await bt.delete()
        await sc.create(this.taskName,newt[1].toDate(),{
            id:`${guildId}.event.notify`,
            data:{
                guildId:guildId,
                time:newt[1]
            }
        });
    }
    init(schedule:Schedule){
        this.schedule=schedule
    }
}