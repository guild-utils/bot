import {Command,CommandStore,KlasaMessage} from 'klasa'
import { GameEventUseCase } from "usecase/game-event";
import { GameEvent}from "pdomain/game-event"
import {  inject, autoInjectable } from 'tsyringe';
import { googleSpreadSheetId } from '../../../settings';
@autoInjectable()
export default class extends Command{
    private readonly gameEvent:GameEventUseCase
    constructor(store: CommandStore, file: string[], directory: string,@inject("GameEventUseCase") gameEvent?:GameEventUseCase) {
        super(store,file,directory,{
            usage:"<collectionName:string>"
        });
        this.gameEvent=gameEvent!
    }
    public async run(msg: KlasaMessage, [collectionName]:[string]): Promise<KlasaMessage | KlasaMessage[] | null>{
        const gsid=msg.guildSettings.get(googleSpreadSheetId)
        const list=await this.gameEvent.collection(gsid,collectionName)
        const arr:GameEvent[]= list.events
        const rep=[`**${list.name.name}** ${list.kind}`,list.header.join(" "),...arr.map(e=>list.header.map(e2=>e.desc[e2]).join(" "))].join("\n")
        return msg.sendMessage(rep)
    }

}