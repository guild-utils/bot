import { Event ,EventStore} from "klasa";
import { GameEventUseCase } from "usecase/game-event";
import { GameEventNotifyRepository } from "pdomain/game-event";
import { autoInjectable, inject } from "tsyringe";
import { googleSpreadSheetId } from "../settings";
@autoInjectable()
export default class extends Event {
	constructor(
        store: EventStore, 
        file: string[], 
        directory: string,
        @inject("GameEventUseCase") private gameEvent:GameEventUseCase,
        @inject("GameEventNotifyRepository") private gameEventNotifyRepository:GameEventNotifyRepository) {
		super(store,file,directory,{

			once: true,
			event: 'klasaReady'
        });
        
    }
    async run(){
        console.log("init")
        await Promise.all(this.client.guilds.cache.map(async e=>{
            const gsid:unknown=this.client.gateways.guilds.get(e.id).get(googleSpreadSheetId)
            if(typeof gsid!=="string"){
                return
            }
            this.gameEventNotifyRepository.register(
                e.id,
                await this.gameEvent.allEvents(gsid)
            )
        }))
    }
}