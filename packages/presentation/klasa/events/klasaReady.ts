import { Event ,EventStore} from "klasa";
import { autoInjectable, inject } from "tsyringe";
import { GameEventNotificationRepository } from "pdomain/game-event";
import { GameEventUseCase } from "usecase/game-event";
import { googleSpreadSheetId } from "../setting_keys";
import { REGISTER_TO_NOTIFICATION_REPOSTORY_WHEN_LAUNCH } from "../global_settings";
@autoInjectable()
export default class extends Event {
	constructor(
        store: EventStore, 
        file: string[], 
        directory: string,
        @inject("GameEventUseCase") private gameEvent:GameEventUseCase,
        @inject("GameEventNotificationRepository") private gameEventNotificationRepository:GameEventNotificationRepository) {
		super(store,file,directory,{

			once: true,
			event: 'klasaReady'
        });
        
    }
    async run(){
        console.log("init");
        if(REGISTER_TO_NOTIFICATION_REPOSTORY_WHEN_LAUNCH){
            await Promise.all(this.client.guilds.cache.map(async e=>{
                const gsid:unknown=this.client.gateways.guilds.get(e.id).get(googleSpreadSheetId)
                if(typeof gsid!=="string"){
                    return;
                }
                this.gameEventNotificationRepository.register(
                    e.id,
                    (await this.gameEvent.allEvents(gsid)).map(e2=>e2[1])
                )
            }));
        }
    }
}