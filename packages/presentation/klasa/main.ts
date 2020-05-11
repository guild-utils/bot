import "reflect-metadata";
import { config as dotenv} from "dotenv";
const result = dotenv();
import { KlasaClient, KlasaClientOptions } from 'klasa';
import { container } from "tsyringe";
import { GssGameEventRepository ,GssCollectionGroupIdT ,HKTGssCollectionName} from "gss/game-event";
import { GameEventUseCaseImpl } from "usecase/game-event";
import { GameEventNotificationRepositoryKlasa } from "schedule";
import { taskName } from "./tasks/event-notice";
import { config,token} from './config';
import { nextTaskId } from "./guild_settings_keys";
import { initChannelsGateway } from "./extendables/channelSettings";
if(result){
	console.log(result.parsed);

}
const gameEventNotificationRepository=new GameEventNotificationRepositoryKlasa(taskName,nextTaskId);
class Client extends KlasaClient {

	constructor(options: KlasaClientOptions) {
		super(options);
		gameEventNotificationRepository.init(this);
		// Add any properties to your Klasa Client
	}

	// Add any methods to your Klasa Client

}
const usecase=new GameEventUseCaseImpl<GssGameEventRepository,GssCollectionGroupIdT,HKTGssCollectionName>(new GssGameEventRepository());
KlasaClient.defaultGuildSchema.add(
	"momentLocale","string",{default:"ja"}
);
KlasaClient.defaultGuildSchema.add(
	"momentTZ","string",{default:"Asia/Tokyo"}
)
KlasaClient.defaultGuildSchema.add('event',f=>{
	f.add("sheet","GoogleSpreadSheet")
	f.add("notificationChannel","TextChannel")
	f.add("nextTaskId","string",{configurable:false})
});
KlasaClient.defaultGuildSchema.add('counter',f=>{
	f.add("displayChannels","channel",{
		configurable:false,
		array:true,
	});
})
container.register("GameEventUseCase",{useValue:usecase});
container.register("GameEventNotificationRepository",{useValue:gameEventNotificationRepository});
const client =new Client(config);
initChannelsGateway(client.gateways)
client.login(token);
