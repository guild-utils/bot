/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { KlasaClient } from "klasa";
import { DependencyContainer } from "tsyringe";
import { Schema } from "klasa";
import { VoiceKindArray, initEngineAndKuromoji } from "presentation_core";
import { credentials, VerifyOptions } from "grpc";
import { MixerClient } from "sound-mixing-proto/index_grpc_pb";
import { promises as fs } from "fs";
export default async function initText2Speech(
  container: DependencyContainer
): Promise<void> {
  initSchema();
  const grpcMixerClient = process.env["GUJ_MIXER_RPC_SERVER"]
    ? new MixerClient(
        process.env["GUJ_MIXER_RPC_SERVER"],
        await makeCredentials(process.env["GUJ_MIXER_KEYS"])
      )
    : undefined;
  await initEngineAndKuromoji(container, grpcMixerClient);
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
function initSchema() {
  const randomizerVersions = ["v1", "v2"];
  KlasaClient.defaultGuildSchema.add("speech", (f) => {
    f.add("targets", "TextChannel", {
      configurable: false,
      array: true,
    });
    f.add("readName", "boolean", { default: true });
    f.add("maxReadLimit", "integer", {
      default: 130,
      max: 400,
      min: 0,
      filter: (_client, value) => {
        if (!Number.isInteger(value)) {
          return true;
        }
        if (value > 400) {
          return true;
        }
        if (value < 0) {
          return true;
        }
        return false;
      },
    });
    f.add("randomizer", "string", {
      filter: (_client, value) => {
        return !randomizerVersions.includes(value);
      },
    });
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  ((KlasaClient as any).defaultMemberSchema as Schema).add("speech", (f) => {
    f.add("kind", "string", {
      filter: (_client, value) => {
        return !VoiceKindArray.includes(value);
      },
    });
    f.add("speed", "float", {
      min: 0.3,
      filter: (_client, value) => {
        return value < 0.3;
      },
    });
    f.add("tone", "float");
    f.add("volume", "float", {
      max: 10,
      filter: (_client, value) => {
        return value > 10;
      },
    });
    f.add("readName", "string");
    f.add("allpass", "float", {
      max: 1,
      min: 0,
      filter: (_client, value) => {
        return value > 1 || value < 0;
      },
    });
    f.add("intone", "float", {
      max: 4,
      min: 0,
      filter: (_client, value) => {
        return value > 4 || value < 0;
      },
    });
    f.add("threshold", "float", {
      max: 1,
      min: 0,
      filter: (_client, value) => {
        return value > 1 || value < 0;
      },
    });
    f.add("randomizer", "string", {
      filter: (_client, value) => {
        return !randomizerVersions.includes(value);
      },
    });
  });

  KlasaClient.defaultUserSchema.add("speech", (f) => {
    f.add("kind", "string", {
      filter: (_client, value) => {
        return !VoiceKindArray.includes(value);
      },
    });
    f.add("speed", "float", {
      min: 0.3,
      filter: (_client, value) => {
        return value < 0.3;
      },
    });
    f.add("tone", "float");
    f.add("volume", "float", {
      max: 10,
      filter: (_client, value) => {
        return value > 10;
      },
    });
    f.add("readName", "string");
    f.add("allpass", "float", {
      max: 1,
      min: 0,
      filter: (_client, value) => {
        return value > 1 || value < 0;
      },
    });
    f.add("intone", "float", {
      max: 4,
      min: 0,
      filter: (_client, value) => {
        return value > 4 || value < 0;
      },
    });
    f.add("threshold", "float", {
      max: 1,
      min: 0,
      filter: (_client, value) => {
        return value > 1 || value < 0;
      },
    });
    f.add("randomizer", "string", {
      filter: (_client, value) => {
        return !randomizerVersions.includes(value);
      },
    });
  });
}
