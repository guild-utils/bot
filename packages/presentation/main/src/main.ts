/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "reflect-metadata";
import "abort-controller/polyfill";
import { Usecase as AppliedVoiceConfigResolver } from "protocol_configs-klasa";
import { MongoDictionaryRepository } from "repository_mongodb-dictionary";
import { container } from "tsyringe";
import { config, token } from "./config";
import initRpcServer from "./bootstrap/grpc";
import { initDatabase } from "./bootstrap/mongo";
import { Client, Permissions } from "discord.js";
import {
  initInstanceState,
  initText2Speech,
  MonitorRunnerWithLog,
  scheduleExitGuilds,
} from "presentation_core";
import * as ENV from "./bootstrap/env";
import { CachedBasicConfigRepository } from "repository_cache-guild-configs";
import { MongoBasicBotConfigRepository } from "repository_mongo-guild-configs";
import {
  CacheGuildVoiceConfigRepository,
  CacheMemberLayeredVoiceConfigRepository,
  CacheSimpleLayeredVoiceConfigRepository,
} from "repository_cache-voice-configs";
import {
  MongoSimpleLayeredVoiceConfigRepository,
  MongoGuildVoiceConfigRepository,
} from "repository_mongo-voice-configs";
import { CacheTextToSpeechTargetChannelDataStore } from "repository_cache-guild-tts-target-channels";
import { MongoTextToSpeechTargetChannelDataStore } from "repository_mongo-guild-tts-target-channels";
import { defineSchemas, initCommandSystem } from "./bootstrap/commands";
import { configurateUsecaseCore } from "presentation_core";
import {
  layeredConfigureUsecase,
  mainConfigurateUsecase,
} from "./usecases/configurate";
import { createMonitor } from "./bootstrap/monitors";
import { initEvents } from "./bootstrap/events";
import {
  createInviteLink,
  getLang as getLangBase,
  createConfigPermissionChecker,
  initSystemMetrics,
} from "presentation_core";
import { CommandSchema } from "@guild-utils/command-schema";
import { BotLogger, initProcessErrorHandler } from "presentation_core";
import { connectRxEnv, createRxEnv } from "./gui/pagination/action-pipeline";
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
  container.register("ThemeColor", {
    useValue: ENV.GUJ_THEME_COLOR,
  });
  const [kuromoji, engine] = await initText2Speech(container);
  const db = await initDatabase({
    connectionString: ENV.MONGO_CONNECTION,
    host: ENV.MONGO_HOST,
    port: ENV.MONGO_PORT,
    db: ENV.MONGO_DB,
    user: ENV.MONGO_USER,
    password: ENV.MONGO_PASSWORD,
  });
  const language = "ja_JP";
  const prefix = process.env["GUJ_DEFAULT_PREFIX"] ?? "$";
  const basicBotConfig = new CachedBasicConfigRepository(
    new MongoBasicBotConfigRepository(db.collection("guilds"), {
      disabledCommands: [],
      language,
      prefix,
    })
  );
  container.register("BasicBotConfigRepository", { useValue: basicBotConfig });
  const client = new Client(config());
  client.token = token;
  const dict = new MongoDictionaryRepository(db.collection("guilds"));
  const memberVoiceConfig = new CacheMemberLayeredVoiceConfigRepository(
    new MongoSimpleLayeredVoiceConfigRepository(db.collection("members"))
  );
  const userVoiceConfig = new CacheSimpleLayeredVoiceConfigRepository(
    new MongoSimpleLayeredVoiceConfigRepository(db.collection("users"))
  );
  const guildVoiceConfig = new CacheGuildVoiceConfigRepository(
    new MongoGuildVoiceConfigRepository(db.collection("guilds"))
  );

  const appliedVoiceConfigResolver = new AppliedVoiceConfigResolver(
    memberVoiceConfig,
    userVoiceConfig,
    guildVoiceConfig,
    dict,
    {
      getGuildJoinedTimeStamp: (guild) =>
        client.guilds.fetch(guild).then((e) => e.joinedTimestamp),
    }
  );
  container.register("ConfigRepository", {
    useValue: appliedVoiceConfigResolver,
  });
  container.register("DictionaryRepository", {
    useValue: dict,
  });
  const ttsDataStore = new CacheTextToSpeechTargetChannelDataStore(
    new MongoTextToSpeechTargetChannelDataStore(db.collection("guilds"))
  );
  container.register("TextToSpeechTargetChannelDataStore", {
    useValue: ttsDataStore,
  });
  const getLang = getLangBase(basicBotConfig, "ja_JP");
  await initRpcServer(appliedVoiceConfigResolver);
  const instanceState = initInstanceState(
    container,
    client,
    ENV.GUJ_THEME_COLOR
  );

  const schemas = defineSchemas(() => client);
  const commandNames = new Set<string>(
    Object.values(schemas)
      .flatMap((e) => Object.values(e))
      .filter((e): e is CommandSchema => !!e)
      .map((e) => e.name)
  );
  const pc = createConfigPermissionChecker(client);
  BotLogger.info(commandNames, "CommandNames");
  const usecase = layeredConfigureUsecase([
    configurateUsecaseCore(basicBotConfig, pc, commandNames, {
      language: "ja_JP",
      prefix: "$",
      disabledCommands: [],
    }),
    mainConfigurateUsecase(
      {
        guildVoiceConfig,
        memberVoiceConfig,
        userVoiceConfig,
      },
      pc
    ),
  ]);
  const application = await client.fetchApplication();
  const inviteLink = createInviteLink(application, permissions);
  const rxEnv = createRxEnv(client);
  connectRxEnv(rxEnv);
  const { parser, resolver } = initCommandSystem(
    container,
    schemas,
    {
      color: ENV.GUJ_THEME_COLOR,
      configurate: usecase,
      ttsEngine: engine,
      ttsDataStore: ttsDataStore,
      voiceConfig: appliedVoiceConfigResolver,
      getLang,
    },
    {
      after: {
        append: dict.appendAfter.bind(dict),
        get: dict.getAfter.bind(dict),
        remove: dict.removeAfter.bind(dict),
        update: dict.updateAfter.bind(dict),
      },
      before: {
        append: dict.appendBefore.bind(dict),
        get: dict.getBefore.bind(dict),
        remove: dict.removeBefore.bind(dict),
        update: dict.updateBefore.bind(dict),
      },
      dictionary: dict,
      kuromoji,
      rxEnv,
      getLang,
      voiceConfigUsecase: appliedVoiceConfigResolver,
      configurateUsecase: usecase,
      color: ENV.GUJ_THEME_COLOR,
    },
    {
      botConfig: basicBotConfig,
      color: ENV.GUJ_THEME_COLOR,
      usecase: usecase,
    },
    {
      color: ENV.GUJ_THEME_COLOR,
      defaultPrefix: "$",
    }
  );
  const monitors = createMonitor({
    color: ENV.GUJ_THEME_COLOR,
    dataStore: ttsDataStore,
    engine: engine,
    prefix: "$",
    repo: basicBotConfig,
    usecase: appliedVoiceConfigResolver,
    commandResolver: resolver,
    instanceState,
    parser,
    getLang,
  });
  const monitorRunner = new MonitorRunnerWithLog(monitors);
  initEvents(client, {
    basicBotConfig: basicBotConfig,
    color: ENV.GUJ_THEME_COLOR,
    dataStore: ttsDataStore,
    engine,
    instanceState,
    monitorRunner,
    inviteLink,
  });
  await client.login(token);
  await Promise.resolve(
    client.user?.setActivity("4/8(木)運用終了", {
      type: "PLAYING",
    })
  );
  scheduleExitGuilds(client, 1617807600000);
}
main().catch((e) => {
  BotLogger.fatal(e);
  process.exit(-1);
});
