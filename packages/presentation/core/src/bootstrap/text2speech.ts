import { DependencyContainer } from "tsyringe";
import Engine from "../text2speech/engine";
import { initEngineAndKuromoji } from "./engine";
import { credentials, VerifyOptions } from "grpc";
import { MixerClient } from "sound-mixing-proto/index_grpc_pb";
import { promises as fs } from "fs";
import { IpadicFeatures, Tokenizer } from "kuromoji";
export async function initText2Speech(
  container: DependencyContainer
): Promise<[Tokenizer<IpadicFeatures>, Engine]> {
  const grpcMixerClient = process.env["GUJ_MIXER_RPC_SERVER"]
    ? new MixerClient(
        process.env["GUJ_MIXER_RPC_SERVER"],
        await makeCredentials(process.env["GUJ_MIXER_KEYS"])
      )
    : undefined;
  return await initEngineAndKuromoji(container, grpcMixerClient);
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
