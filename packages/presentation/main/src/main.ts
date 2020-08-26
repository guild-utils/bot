/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "reflect-metadata";
import "abort-controller/polyfill";
import MemberGatewayPlugin from "klasa-member-gateway";
import {
  Usecase as KlasaUsecase,
  //  DictionaryRepository as KlasaDictionaryRepository,
} from "protocol_configs-klasa";
import { MongoDictionaryRepository } from "repository_mongodb-dictionary";
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
import { initMongo } from "./bootstrap/mongo";
import { Permissions } from "discord.js";
import initKlasaCoreCommandRewrite from "presentation_klasa-core-command-rewrite";
import {
  initMainDictionaryGui,
  initBADictionaryGui,
} from "./bootstrap/dictionary-gui";
import { initInstanceState } from "presentation_core";

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
  .add(Permissions.FLAGS.ADD_REACTIONS)
  .add(Permissions.FLAGS.MANAGE_MESSAGES)
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
  await initMongo(client);
  const dict = new MongoDictionaryRepository(
    client.mongodb.collection("guilds")
  );
  const configRepo = new KlasaUsecase(client.gateways, dict);
  container.register("ConfigRepository", {
    useValue: configRepo,
  });
  container.register("DictionaryRepository", {
    useValue: dict,
  });
  const emptyMessageObj = {
    emptyMessage: "現在辞書にはなにも登録されていません。",
  };
  const mainDictionaryGui = initMainDictionaryGui(container, emptyMessageObj);
  const baDictionaryGuis = initBADictionaryGui(container, emptyMessageObj);
  container.register("GuiControllers", {
    useValue: [mainDictionaryGui, ...baDictionaryGuis],
  });
  initChannelsGateway(client.gateways);
  initRpcServer(configRepo);
  initStarBoard();
  initInstanceState(container, client);
  await client.login(token);
  await initKlasaCoreCommandRewrite(client.arguments, client.commands);
}
main().catch(console.log);
