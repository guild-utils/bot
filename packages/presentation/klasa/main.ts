import "reflect-metadata";
import { KlasaClient, KlasaClientOptions } from 'klasa';
import { config, token } from './config';
import { container } from "tsyringe";
import { GssGameEventRepository ,GssCollectionGroupIdT ,HKTGssCollectionName} from "gss/game-event";
import { GameEventUseCaseImpl } from "usecase/game-event";
import { GameEventNotifyRepositoryKlasa } from "schedule";
import { taskName } from "./tasks/event-notice";
import { nextTaskId } from "./settings";
const gameEventNotifyRepository=new GameEventNotifyRepositoryKlasa(taskName,nextTaskId);
class Client extends KlasaClient {

	constructor(options: KlasaClientOptions) {
		super(options);
		gameEventNotifyRepository.init(this);
		// Add any properties to your Klasa Client
	}

	// Add any methods to your Klasa Client

}
const usecase=new GameEventUseCaseImpl<GssGameEventRepository,GssCollectionGroupIdT,HKTGssCollectionName>(new GssGameEventRepository());
KlasaClient.defaultGuildSchema.add('event',f=>{
	f.add("gsid","string")
	f.add("noticeChannel","TextChannel")
	f.add("nextTaskId","string")
});
container.register("GameEventUseCase",{useValue:usecase});
container.register("GameEventNotifyRepository",{useValue:gameEventNotifyRepository});
const client =new Client(config);

client.login(token);
