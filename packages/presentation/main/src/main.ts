/* eslint-disable @typescript-eslint/no-non-null-assertion */
import "reflect-metadata";
import "abort-controller/polyfill";
import { Usecase as AppliedVoiceConfigResolver } from "protocol_configs-klasa";
import { MongoDictionaryRepository } from "repository_mongodb-dictionary";
import { config as dotenv } from "dotenv";
import { KlasaClient, KlasaClientOptions } from "klasa";
import { container } from "tsyringe";
import { config, token } from "./config";
import initRpcServer from "./bootstrap/grpc";
import initText2Speech from "./bootstrap/text2speech";
import { initDatabase } from "./bootstrap/mongo";
import { Permissions } from "discord.js";
import initKlasaCoreCommandRewrite from "presentation_klasa-core-command-rewrite";
import {
  initMainDictionaryGui,
  initBADictionaryGui,
} from "./bootstrap/dictionary-gui";
import { initInstanceState } from "presentation_core";
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
const result = dotenv();
if (result) {
  console.log(result.parsed);
}

KlasaClient.basePermissions
  .add(Permissions.FLAGS.ADD_REACTIONS)
  .add(Permissions.FLAGS.MANAGE_MESSAGES)
  .add(Permissions.FLAGS.CONNECT)
  .add(Permissions.FLAGS.SPEAK)
  .add(Permissions.FLAGS.ATTACH_FILES)
  .add(Permissions.FLAGS.EMBED_LINKS);
async function main() {
  class Client extends KlasaClient {
    constructor(options: KlasaClientOptions) {
      super(options);
    }
  }
  await initText2Speech(container);
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
  const client = new Client(config(basicBotConfig));
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
  container.register("TextToSpeechTargetChannelDataStore", {
    useValue: new CacheTextToSpeechTargetChannelDataStore(
      new MongoTextToSpeechTargetChannelDataStore(db.collection("guilds"))
    ),
  });
  const messageObj = {
    emptyMessage: "現在辞書にはなにも登録されていません。",
  };
  const mainDictionaryGui = initMainDictionaryGui(container, messageObj);
  const baDictionaryGuis = initBADictionaryGui(container, messageObj);
  container.register("GuiControllers", {
    useValue: [mainDictionaryGui, ...baDictionaryGuis],
  });
  initRpcServer(appliedVoiceConfigResolver);
  initInstanceState(container, client);
  await client.login(token);
  await initKlasaCoreCommandRewrite(client.arguments, client.commands);
}
main().catch(console.log);
