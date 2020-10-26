/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "reflect-metadata";
import "abort-controller/polyfill";
import { Usecase as AppliedVoiceConfigResolver } from "protocol_configs-klasa";
import { MongoDictionaryRepository } from "repository_mongodb-dictionary";
import { config as dotenv } from "dotenv";
import { container } from "tsyringe";
import { config, token } from "./config";
import initRpcServer from "./bootstrap/grpc";
import { initDatabase } from "./bootstrap/mongo";
import { Client, Permissions } from "discord.js";
import {
  initMainDictionaryGui,
  initBADictionaryGui,
  GuiTexts,
} from "./bootstrap/dictionary-gui";
import { initInstanceState, initText2Speech } from "presentation_core";
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
import { MonitorRunner } from "monitor-discord.js";
import {
  createInviteLink,
  getLang as getLangBase,
  createConfigPermissionChecker,
} from "presentation_core";
import { Gui } from "./gui/common";
import { CommandSchema } from "@guild-utils/command-schema";
const result = dotenv();
if (result) {
  console.log(result.parsed);
}

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

  const messageObj = (): GuiTexts => ({
    empty: "現在辞書にはなにも登録されていません。",
    help: [
      "リアクションまたは対応したテキストを送信することで操作が可能です。",
      "何も操作がないまま1分経過すると自動的に終了されます。",
      "",
      "\u23ea **<<** **f**",
      "先頭へ",
      "\u25c0 **<** **b**",
      "前へ",
      "\u23f9 **q**",
      "閉じる",
      "\u25b6 **>** **n**",
      "次へ",
      "\u23e9 **>>** **l**",
      "最後へ",
      "\u2753 **?** **h**",
      "ヘルプ",
      "",
      "もう一度?を押すか、その他の操作をすることでヘルプを閉じることができます。",
    ].join("\n"),
  });
  const mainDictionaryGui = initMainDictionaryGui(
    container,
    messageObj,
    getLang
  );
  const baDictionaryGuis = initBADictionaryGui(container, messageObj, getLang);
  const guiControllers: Gui[] = [
    mainDictionaryGui,
    ...baDictionaryGuis,
  ] as Gui[];
  container.register("GuiControllers", {
    useValue: guiControllers,
  });
  initRpcServer(appliedVoiceConfigResolver);
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
  console.log("CommandNames:", commandNames);
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
      afterGui: baDictionaryGuis[1],
      beforeGui: baDictionaryGuis[0],
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
      mainGui: mainDictionaryGui,
      getLang,
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
  const monitorRunner = new MonitorRunner(monitors);
  initEvents(client, {
    basicBotConfig: basicBotConfig,
    color: ENV.GUJ_THEME_COLOR,
    dataStore: ttsDataStore,
    engine,
    instanceState,
    monitorRunner,
    inviteLink,
    guiControllers,
  });
  await client.login(token);
}
main().catch((e) => {
  console.error(e);
  process.exit(-1);
});
