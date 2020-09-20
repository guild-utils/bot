import {
  GuildVoiceConfigRepository,
  GuildVoiceConfig,
  UpdateResult,
  Randomizer,
} from "domain_voice-configs-write";
import { Collection } from "mongodb";
export type MongoGuildVoiceConfigCollectionType = {
  speech?: {
    randomizer?: keyof typeof Randomizer | null;
    maxReadLimit?: number | null;
    readName?: boolean | null;
    maxVolume?: number | null;
  } | null;
};
import $ from "mongo-dot-notation";

export class MongoGuildVoiceConfigRepository
  implements GuildVoiceConfigRepository {
  constructor(
    private readonly collection: Collection<MongoGuildVoiceConfigCollectionType>
  ) {}
  async set(
    guild: string,
    newC: GuildVoiceConfig
  ): Promise<UpdateResult<GuildVoiceConfig, GuildVoiceConfig>> {
    const r = await this.collection.findOneAndUpdate(
      { id: guild },
      {
        $set: $.flatten(newC),
      },
      {
        projection: {
          speech: {
            randomizer: 1,
            maxReadLimit: 1,
            readName: 1,
            maxVolume: 1,
          },
        },
        upsert: true,
      }
    );
    const rr = r.value?.speech;
    return {
      type: r.ok ? "ok" : "error",
      after: newC,
      before: {
        maxReadLimit: rr?.maxReadLimit ?? undefined,
        maxVolume: rr?.maxVolume ?? undefined,
        randomizer: rr?.randomizer ?? undefined,
        readName: rr?.readName ?? undefined,
      },
    };
  }
  async get(guild: string): Promise<GuildVoiceConfig> {
    const r = await this.collection.findOne(
      { id: guild },
      {
        projection: {
          speech: {
            randomizer: 1,
            maxReadLimit: 1,
            readName: 1,
            maxVolume: 1,
          },
        },
      }
    );
    const rr = r?.speech as MongoGuildVoiceConfigCollectionType["speech"];
    return {
      maxReadLimit: rr?.maxReadLimit ?? undefined,
      maxVolume: rr?.maxVolume ?? undefined,
      randomizer: rr?.randomizer ?? undefined,
      readName: rr?.readName ?? undefined,
    };
  }
  async setBase<T>(
    layerKey: string,
    k: string,
    v: T
  ): Promise<UpdateResult<T>> {
    const ks = `speech.${k}`;
    const r = await this.collection.findOneAndUpdate(
      { id: layerKey },
      {
        $set: {
          [ks]: v,
        },
      },
      {
        projection: {
          [ks]: 1,
        },
      }
    );
    const rvr = r.value?.speech;
    const rv = (rvr ? rvr[k] : undefined) as T | undefined;
    return {
      type: !r.ok ? "error" : rv === v ? "same" : "ok",
      after: v,
      before: rv ?? undefined,
    };
  }
  setReadName(
    guild: string,
    v: boolean
  ): Promise<UpdateResult<boolean, boolean>> {
    return this.setBase(guild, "readName", v);
  }
  setMaxReadLimit(
    guild: string,
    v: number
  ): Promise<UpdateResult<number, number>> {
    return this.setBase(guild, "maxReadLimit", v);
  }
  setMaxVolume(
    guild: string,
    v: number
  ): Promise<UpdateResult<number, number>> {
    return this.setBase(guild, "maxVolume", v);
  }
  setRandomizer(
    guild: string,
    v: "v1" | "v2"
  ): Promise<UpdateResult<"v1" | "v2", "v1" | "v2">> {
    return this.setBase(guild, "randomizer", v);
  }
  async setIfNotChanged(
    guild: string,
    newC: GuildVoiceConfig,
    comp: GuildVoiceConfig
  ): Promise<UpdateResult<GuildVoiceConfig, GuildVoiceConfig>> {
    const r = await this.collection.updateOne(
      {
        id: guild,
        ...$.flatten({ speech: comp }),
      },
      {
        $set: $.flatten(newC),
      },
      {
        upsert: true,
      }
    );
    if (!r.matchedCount) {
      return {
        type: "not matched",
      };
    }
    return {
      type: "ok",
      after: newC,
      before: comp,
    };
  }
}
