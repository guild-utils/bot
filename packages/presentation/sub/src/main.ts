import "reflect-metadata";
import { Usecase } from "presentation_rpc-client";
import { container } from "tsyringe";
import {
  IConfigManagerClient,
  ConfigManagerClient,
} from "presentation_protos/config_grpc_pb";
import { credentials, VerifyOptions } from "grpc";
import { ClientResponseTransformer } from "presentation_rpc-client";
import { initEngineAndKuromoji } from "presentation_core";
import initKlasaCoreCommandRewrite from "presentation_klasa-core-command-rewrite";
import { KlasaClient, KlasaClientOptions } from "klasa";
import { config, token } from "./config";
import { MixerClient } from "sound-mixing-proto/index_grpc_pb";
import { promises as fs } from "fs";
import { Permissions } from "discord.js";
function initSchema() {
  KlasaClient.defaultGuildSchema.add("speech", (f) => {
    f.add("targets", "TextChannel", {
      configurable: false,
      array: true,
    });
  });
}
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
  .add(Permissions.FLAGS.CONNECT)
  .add(Permissions.FLAGS.SPEAK)
  .add(Permissions.FLAGS.ATTACH_FILES)
  .add(Permissions.FLAGS.EMBED_LINKS);
async function main() {
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
  await initEngineAndKuromoji(container, grpcMixerClient);
  class Client extends KlasaClient {
    constructor(options: KlasaClientOptions) {
      super(options);
    }
  }
  initSchema();
  const discordClient = new Client(config);
  initKlasaCoreCommandRewrite(discordClient.arguments, discordClient.commands);

  await discordClient.login(token);
}
main().catch(console.log);
