import {Command,CommandStore,KlasaMessage} from 'klasa';
import { autoInjectable,inject} from 'tsyringe';
import { GameEventUseCase } from "usecase/game-event";
import { GameEvent}from "pdomain/game-event";
import { googleSpreadSheetId } from '../../../settings';
@autoInjectable()
export default class Put extends Command{
    private readonly gameEvent:GameEventUseCase
    constructor( store: CommandStore, file: string[], directory: string,@inject("GameEventUseCase") gameEvent?:GameEventUseCase) {
        super(store,file,directory,{
            usage:"<collectionName:string> <eventName:string> <timingDSL:string>"
        })
        this.gameEvent=gameEvent!
    }
    public async run(msg: KlasaMessage, [collectionName,eventName]:[string,string]): Promise<KlasaMessage | KlasaMessage[] | null>{
        const gsid=msg.guildSettings.get(googleSpreadSheetId)
        const list=await this.gameEvent.collection(gsid,collectionName)
        const arr:GameEvent[]= list.events
        const rep=[`**${list.name}** ${list.kind}`,...arr.map(e=>e.name)].join("\n")
        
        return msg.sendMessage(rep)
    }

}