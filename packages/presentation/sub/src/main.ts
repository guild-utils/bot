import "reflect-metadata";
import { Usecase } from "protocol_rpc-client";
import { container } from "tsyringe";
import {
  IConfigManagerClient,
  ConfigManagerClient,
} from "protocol_protos/config_grpc_pb";
import { credentials, VerifyOptions } from "grpc";
import { ClientResponseTransformer } from "protocol_rpc-client";
import { initEngineAndKuromoji, initInstanceState } from "presentation_core";
import { KlasaClient, KlasaClientOptions } from "klasa";
import { config, token } from "./config";
import { MixerClient } from "sound-mixing-proto/index_grpc_pb";
import { promises as fs } from "fs";
import { Permissions } from "discord.js";
import { initDatabase } from "./bootstrap/mongo";
import * as ENV from "./bootstrap/env";
import { CacheTextToSpeechTargetChannelDataStore } from "repository_cache-guild-tts-target-channels";
import { MongoTextToSpeechTargetChannelDataStore } from "repository_mongo-guild-tts-target-channels";
async function makeCredentials(keys: string | undefined) {
  const options: VerifyOptions = {
    checkServerIdentity: () => undefined,
  };
  return keys
    ? credentials.createSsl(
        await fs.readFile(keys + "/ca.crt"),
        await fs.readFile(keys + "/client.key"),
        await fs.readFile(keys + "/client.crt"),
        options
      )
    : credentials.createInsecure();
}
KlasaClient.basePermissions
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
  const grpcConfigClient: IConfigManagerClient = new ConfigManagerClient(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env["GUILD_UTILS_J_RPC_SERVER"]!,
    credentials.createInsecure()
  );
  const grpcMixerClient = process.env["GUJ_MIXER_RPC_SERVER"]
    ? new MixerClient(
        process.env["GUJ_MIXER_RPC_SERVER"],
        await makeCredentials(process.env["GUJ_MIXER_KEYS"])
      )
    : undefined;
  const usecase = new Usecase(
    grpcConfigClient,
    new ClientResponseTransformer()
  );
  container.register("ConfigRepository", { useValue: usecase });
  container.register("TextToSpeechTargetChannelDataStore", {
    useValue: new CacheTextToSpeechTargetChannelDataStore(
      new MongoTextToSpeechTargetChannelDataStore(db.collection("guilds"))
    ),
  });
  await initEngineAndKuromoji(container, grpcMixerClient);
  class Client extends KlasaClient {
    constructor(options: KlasaClientOptions) {
      super(options);
    }
  }
  const discordClient = new Client(config(db.collection("guilds")));
  initInstanceState(container, discordClient, ENV.GUJ_THEME_COLOR);
  await discordClient.login(token);
}
main().catch(console.log);
