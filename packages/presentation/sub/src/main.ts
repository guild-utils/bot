import "reflect-metadata";
import { Usecase } from "protocol_rpc-client";
import { container } from "tsyringe";
import {
  IConfigManagerClient,
  ConfigManagerClient,
} from "protocol_protos/config_grpc_pb";
import { credentials } from "grpc";
import { ClientResponseTransformer } from "protocol_rpc-client";
import {
  configurateUsecaseCore,
  getLang as getLangBase,
  initInstanceState,
  initText2Speech,
  createConfigPermissionChecker,
  createCoreMonitor,
  initCoreEvents,
  createInviteLink,
  MonitorRunnerWithLog,
  initProcessErrorHandler,
  initSystemMetrics,
  BotLogger,
} from "presentation_core";
import { config, token } from "./config";
import { Client, Permissions } from "discord.js";
import { initDatabase } from "./bootstrap/mongo";
import * as ENV from "./bootstrap/env";
import { CacheTextToSpeechTargetChannelDataStore } from "repository_cache-guild-tts-target-channels";
import { MongoTextToSpeechTargetChannelDataStore } from "repository_mongo-guild-tts-target-channels";
import { defineSchema, initCommandSystem } from "./bootstrap/commands";
import { CachedBasicConfigRepository } from "repository_cache-guild-configs";
import { MongoBasicBotConfigRepository } from "repository_mongo-guild-configs";
import { CommandSchema } from "@guild-utils/command-schema";

initProcessErrorHandler();
initSystemMetrics();

const permissions = new Permissions()
  .add(Permissions.FLAGS.SEND_MESSAGES)
  .add(Permissions.FLAGS.VIEW_CHANNEL)
  .add(Permissions.FLAGS.READ_MESSAGE_HISTORY)
  .add(Permissions.FLAGS.ADD_REACTIONS)
  .add(Permissions.FLAGS.MANAGE_MESSAGES)
  .add(Permissions.FLAGS.CONNECT)
  .add(Permissions.FLAGS.SPEAK)
  .add(Permissions.FLAGS.ATTACH_FILES)
  .add(Permissions.FLAGS.EMBED_LINKS);

async function main() {
  const db = await initDatabase({
    connectionString: ENV.MONGO_CONNECTION,
    host: ENV.MONGO_HOST,
    port: ENV.MONGO_PORT,
    db: ENV.MONGO_DB,
    user: ENV.MONGO_USER,
    password: ENV.MONGO_PASSWORD,
  });
  const [, ttsEngine] = await initText2Speech(container);

  const grpcConfigClient: IConfigManagerClient = new ConfigManagerClient(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env["GUILD_UTILS_J_RPC_SERVER"]!,
    credentials.createInsecure()
  );
  const voiceConfig = new Usecase(
    grpcConfigClient,
    new ClientResponseTransformer()
  );
  const prefix = process.env["GUJ_DEFAULT_PREFIX"] ?? "$.";
  const language = "ja_JP";
  const basicBotConfig = new CachedBasicConfigRepository(
    new MongoBasicBotConfigRepository(db.collection("guilds"), {
      disabledCommands: [],
      language: language,
      prefix: prefix,
    })
  );
  const ttsDataStore = new CacheTextToSpeechTargetChannelDataStore(
    new MongoTextToSpeechTargetChannelDataStore(db.collection("guilds"))
  );
  const discordClient = new Client(config());
  discordClient.token = token;
  const application = await discordClient.fetchApplication();
  const instanceState = initInstanceState(
    container,
    discordClient,
    ENV.GUJ_THEME_COLOR
  );
  const getLang = getLangBase(basicBotConfig, language);
  const schema = defineSchema(() => discordClient);
  const commandNames = new Set<string>(
    Object.values(schema)
      .filter((e): e is CommandSchema => !!e)
      .map((e) => e.name)
  );
  const { parser, resolver } = initCommandSystem(
    container,
    {
      schema,
      color: ENV.GUJ_THEME_COLOR,
      configurate: configurateUsecaseCore(
        basicBotConfig,
        createConfigPermissionChecker(discordClient),
        commandNames,
        {
          disabledCommands: [],
          language,
          prefix,
        }
      ),
      getLang,
      ttsDataStore,
      ttsEngine,
      voiceConfig: voiceConfig,
      botConfig: basicBotConfig,
    },
    {
      color: ENV.GUJ_THEME_COLOR,
      defaultPrefix: prefix,
    }
  );
  const monitors = createCoreMonitor({
    color: ENV.GUJ_THEME_COLOR,
    commandResolver: resolver,
    dataStore: ttsDataStore,
    engine: ttsEngine,
    getLang,
    instanceState,
    parser: parser,
    prefix,
    repo: basicBotConfig,
    usecase: voiceConfig,
  });
  initCoreEvents(discordClient, {
    basicBotConfig,
    color: ENV.GUJ_THEME_COLOR,
    dataStore: ttsDataStore,
    engine: ttsEngine,
    instanceState,
    inviteLink: createInviteLink(application, permissions),
    monitorRunner: new MonitorRunnerWithLog(monitors),
  });
  await discordClient.login(token);
}
main().catch((e) => {
  BotLogger.error(e, "Launch Failed!");
  setTimeout(() => {
    process.exit(1);
  }, 5);
});
