/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "reflect-metadata";
import MemberGatewayPlugin from "klasa-member-gateway";
import {
  Usecase as KlasaUsecase,
  DictionaryRepository as KlasaDictionaryRepository,
} from "presentation_configs-klasa";
import { config as dotenv } from "dotenv";
const result = dotenv();
import { KlasaClient, KlasaClientOptions, Settings } from "klasa";
import { container } from "tsyringe";
import { GameEventNotificationRepositoryKlasa } from "repository_schedule";
import { config, token } from "./config";
import { initChannelsGateway } from "./channelSettings";
import { taskName } from "./tasks/event-notice";
import * as GUILD_SETINGS from "./guild_settings_keys";
import initRpcServer from "./bootstrap/grpc";
import initGameEvent from "./bootstrap/schedule";
import initText2Speech from "./bootstrap/text2speech";
import initStarBoard from "./bootstrap/starBoard";
import { Permissions } from "discord.js";
import initKlasaCoreCommandRewrite from "presentation_klasa-core-command-rewrite";
if (result) {
  console.log(result.parsed);
}

declare module "discord.js" {
  interface GuildMember {
    settings: Settings;
  }
}
function initMemberGateway(Client: typeof KlasaClient) {
  Client.use(MemberGatewayPlugin);
}
KlasaClient.basePermissions
  .add(Permissions.FLAGS.CONNECT)
  .add(Permissions.FLAGS.SPEAK)
  .add(Permissions.FLAGS.ATTACH_FILES)
  .add(Permissions.FLAGS.EMBED_LINKS);
async function main() {
  const gameEventNotificationRepository = new GameEventNotificationRepositoryKlasa(
    taskName,
    GUILD_SETINGS.nextTaskId
  );
  class Client extends KlasaClient {
    constructor(options: KlasaClientOptions) {
      super(options);
      gameEventNotificationRepository.init(this);
    }
  }
  initGameEvent(container, gameEventNotificationRepository);
  initMemberGateway(Client);
  await initText2Speech(container);
  const client = new Client(config);
  const dict = new KlasaDictionaryRepository(client.gateways);
  const configRepo = new KlasaUsecase(client.gateways, dict);
  container.register("ConfigRepository", {
    useValue: configRepo,
  });
  container.register("DictionaryRepository", {
    useValue: dict,
  });
  initChannelsGateway(client.gateways);

  initRpcServer(configRepo);
  initStarBoard();
  await client.login(token);
  initKlasaCoreCommandRewrite(client.arguments, client.commands);
}
main().catch(console.log);
