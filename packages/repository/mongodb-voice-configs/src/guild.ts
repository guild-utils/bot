import {
  GuildVoiceConfigRepository,
  GuildVoiceConfig,
  UpdateResult,
  RandomizerTypeGuild,
} from "domain_voice-configs-write";
import { Collection } from "mongodb";
export type MongoGuildVoiceConfigCollectionType = {
  speech?: {
    randomizer?: RandomizerTypeGuild | null;
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    const rr = r?.speech;
    return {
      maxReadLimit: rr?.maxReadLimit ?? undefined,
      maxVolume: rr?.maxVolume ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      randomizer: rr?.randomizer ?? undefined,
      readName: rr?.readName ?? undefined,
    };
  }
  private async setBase<T>(
    layerKey: string,
    k: string,
    v: T,
    beforeDefaultValue?: T
  ): Promise<UpdateResult<T | undefined>> {
    const ks = `speech.${k}`;
    const r = await this.collection.findOneAndUpdate(
      { id: layerKey },
      {
        ...(v == null
          ? {
              $unset: {
                [ks]: 1,
              },
            }
          : {
              $set: {
                [ks]: v,
              },
            }),
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
      before: rv ?? beforeDefaultValue,
    };
  }
  setReadName(
    guild: string,
    v: boolean | undefined
  ): Promise<UpdateResult<boolean | undefined>> {
    return this.setBase(guild, "readName", v);
  }
  setMaxReadLimit(
    guild: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    return this.setBase(guild, "maxReadLimit", v);
  }
  setMaxVolume(
    guild: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    return this.setBase(guild, "maxVolume", v);
  }
  setRandomizer(
    guild: string,
    v: RandomizerTypeGuild | undefined
  ): Promise<UpdateResult<RandomizerTypeGuild | undefined>> {
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
