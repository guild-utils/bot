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
import { initChannelsGateway } from "./channelSettings";
import engine from "./text2speech/engine";
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
});
KlasaClient.defaultGuildSchema.add('speech',f=>{
	f.add("targets","TextChannel",{
		configurable:false,
		array:true,
	});
});
KlasaClient.defaultUserSchema.add('speech',f=>{
	f.add("kind","string",{default:"neutral"});
	f.add("speed","float",{default:1.0});
	f.add("tone","float",{default:0.0});
	f.add("volume","float",{default:0.0});
});

container.register("GameEventUseCase",{useValue:usecase});
container.register("GameEventNotificationRepository",{useValue:gameEventNotificationRepository});
container.register(
	"engine",
	{
		useValue:new engine(
			process.env["OPEN_JTALK_BIN"]!,
			process.env["OPEN_JTALK_DIC"]!,
			{
				normal:process.env["HTS_VOICE_NORMAL"]!,
				angry:process.env["HTS_VOICE_ANGRY"]!,
				happy:process.env["HTS_VOICE_HAPPY"]!,
				neutral:process.env["HTS_VOICE_NEUTRAL"]!,
				sad:process.env["HTS_VOICE_SAD"]!
			}
		)
	}
)
const client =new Client(config);
initChannelsGateway(client.gateways);

client.login(token);
