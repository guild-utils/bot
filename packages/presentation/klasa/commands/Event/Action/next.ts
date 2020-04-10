import {Command,CommandStore,KlasaMessage} from 'klasa';
import { autoInjectable,inject} from 'tsyringe';
import { GameEventUseCase } from "usecase/game-event";
import { googleSpreadSheetId } from '../../../settings';
import * as moment from 'moment';
import {  GameEvent } from 'pdomain/game-event';
@autoInjectable()
export default class Next extends Command{
    private readonly gameEvent:GameEventUseCase;
    constructor( store: CommandStore, file: string[], directory: string,@inject("GameEventUseCase") gameEvent?:GameEventUseCase) {
        super(store,file,directory,{
            usage:"[collectionName:string]"
        });
        this.gameEvent=gameEvent!;
    }
    public async run(msg: KlasaMessage, [collectionName]:[string|undefined]): Promise<KlasaMessage | KlasaMessage[] | null>{
        const gsid=msg.guildSettings.get(googleSpreadSheetId);
        const now=moment();
        
        const list=collectionName?await this.process(gsid,collectionName,now):await this.gameEvent.nextEvents(gsid,now);
        return msg.sendMessage(list.map(([c,e,m])=>{
            return e.name+":"+m.clone().locale("ja").format("llll")
        }));
    }
    async process(gsid:any,collectionName:string,now:moment.Moment){
        const [c,e]=await this.gameEvent.nextEventsWithName(gsid,collectionName,now);
        return e.map((e2:[GameEvent,moment.Moment]):[typeof c,GameEvent,moment.Moment]=>[c,e2[0],e2[1]]);
    }
}