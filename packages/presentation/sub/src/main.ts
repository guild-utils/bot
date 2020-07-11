import "reflect-metadata";
import { Usecase } from "presentation_rpc-client";
import { container } from "tsyringe";
import {
  IConfigManagerClient,
  ConfigManagerClient,
} from "presentation_protos/config_grpc_pb";
import { credentials } from "grpc";
import { ClientResponseTransformer } from "presentation_rpc-client";
import { initEngineAndKuromoji } from "presentation_core";
import { KlasaClient, KlasaClientOptions } from "klasa";
import { config, token } from "./config";
function initSchema() {
  KlasaClient.defaultGuildSchema.add("speech", (f) => {
    f.add("targets", "TextChannel", {
      configurable: false,
      array: true,
    });
  });
}
async function main() {
  const grpcClient: IConfigManagerClient = new ConfigManagerClient(
    process.env["GUILD_UTILS_J_RPC_SERVER"]!,
    credentials.createInsecure()
  );
  const usecase = new Usecase(grpcClient, new ClientResponseTransformer());
  container.register("ConfigRepository", { useValue: usecase });
  await initEngineAndKuromoji(container);
  class Client extends KlasaClient {
    constructor(options: KlasaClientOptions) {
      super(options);
    }
  }
  initSchema();
  const discordClient = new Client(config);
  await discordClient.login(token);
}
main().catch(console.log);
