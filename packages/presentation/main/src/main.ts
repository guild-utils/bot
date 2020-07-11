/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "reflect-metadata";
import MemberGatewayPlugin from "klasa-member-gateway";
import KlasaUsecase from "presentation_configs-klasa";
import { config as dotenv } from "dotenv";
const result = dotenv();
import { KlasaClient, KlasaClientOptions, Settings } from "klasa";
import { container } from "tsyringe";
import { GameEventNotificationRepositoryKlasa } from "schedule";
import { config, token } from "./config";
import { initChannelsGateway } from "./channelSettings";
import { taskName } from "./tasks/event-notice";
import * as GUILD_SETINGS from "./guild_settings_keys";
import initRpcServer from "./bootstrap/grpc";
import initGameEvent from "./bootstrap/schedule";
import initText2Speech from "./bootstrap/text2speech";
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
  const configRepo = new KlasaUsecase(client.gateways);
  container.register("ConfigRepository", {
    useValue: configRepo,
  });
  initChannelsGateway(client.gateways);

  initRpcServer(configRepo);
  await client.login(token);
}
main().catch(console.log);
