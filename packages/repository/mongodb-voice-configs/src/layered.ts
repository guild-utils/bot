import {
  LayeredVoiceConfigRepository,
  LayeredVoiceConfig,
  UpdateResult,
  VoiceKindType,
  RandomizerTypeLayered,
} from "domain_voice-configs-write";
import { Collection } from "mongodb";
export type MongoCollectionType = {
  speech?: {
    allpass?: number | null;
    intone?: number | null;
    speed?: number | null;
    threshold?: number | null;
    tone?: number | null;
    volume?: number | null;
    kind?: VoiceKindType | null;
    randomizer?: RandomizerTypeLayered | null;
    readName?: string | null;
  } | null;
};
import $ from "mongo-dot-notation";
import { RepositoryError } from "domain_repository-error";
class MongoLayeredVoiceConfigRepositoryInternal
  implements LayeredVoiceConfigRepository<string> {
  constructor(private readonly collection: Collection<MongoCollectionType>) {}
  async get(layerKey: string): Promise<LayeredVoiceConfig> {
    const r = await this.collection.findOne(
      { id: layerKey },
      {
        projection: {
          speech: {
            allpass: 1,
            intone: 1,
            speed: 1,
            threshold: 1,
            tone: 1,
            volume: 1,
            kind: 1,
            randomizer: 1,
            readName: 1,
          },
        },
      }
    );
    const rr = r?.speech;
    if (!rr) {
      return {
        allpass: undefined,
        intone: undefined,
        kind: undefined,
        randomizer: undefined,
        readName: undefined,
        speed: undefined,
        threshold: undefined,
        tone: undefined,
        volume: undefined,
      };
    }
    return {
      allpass: rr.allpass ?? undefined,
      intone: rr.intone ?? undefined,
      kind: rr.kind ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      randomizer: rr.randomizer ?? undefined,
      readName: rr.readName ?? undefined,
      speed: rr.speed ?? undefined,
      threshold: rr.speed ?? undefined,
      tone: rr.tone ?? undefined,
      volume: rr.volume ?? undefined,
    };
  }
  async set(
    layerKey: string,
    newC: LayeredVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig, LayeredVoiceConfig>> {
    const r = await this.collection.findOneAndUpdate(
      { id: layerKey },
      {
        $set: $.flatten(newC),
      },
      {
        projection: {
          speech: {
            allpass: 1,
            intone: 1,
            speed: 1,
            threshold: 1,
            tone: 1,
            volume: 1,
            kind: 1,
            randomizer: 1,
            readName: 1,
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
        allpass: rr?.allpass ?? undefined,
        intone: rr?.intone ?? undefined,
        kind: rr?.kind ?? undefined,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        randomizer: rr?.randomizer ?? undefined,
        readName: rr?.readName ?? undefined,
        speed: rr?.speed ?? undefined,
        threshold: rr?.speed ?? undefined,
        tone: rr?.tone ?? undefined,
        volume: rr?.volume ?? undefined,
      },
    };
  }
  private async setBase<T>(
    layerKey: string,
    k: string,
    v: T | undefined
  ): Promise<UpdateResult<T | undefined>> {
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
          speech: {
            [k]: 1,
          },
        },
        upsert: true,
      }
    );
    const rvr = r.value?.speech;
    const rv = (rvr ? rvr[k] : undefined) as T | undefined;
    if (!r.ok) {
      throw new RepositoryError(`set${k} is failed`, r.lastErrorObject);
    }
    return {
      type: rv === v ? "same" : "ok",
      after: v,
      before: rv ?? undefined,
    };
  }
  setAllpass(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    return this.setBase(layerKey, "allpass", v);
  }
  setIntone(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    return this.setBase(layerKey, "intone", v);
  }
  setSpeed(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    return this.setBase(layerKey, "speed", v);
  }
  setThreshold(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    return this.setBase(layerKey, "threshold", v);
  }
  setTone(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    return this.setBase(layerKey, "tone", v);
  }
  setVolume(
    layerKey: string,
    v: number | undefined
  ): Promise<UpdateResult<number | undefined>> {
    return this.setBase(layerKey, "volume", v);
  }
  setKind(
    layerKey: string,
    v: VoiceKindType | undefined
  ): Promise<UpdateResult<VoiceKindType | undefined>> {
    return this.setBase(layerKey, "kind", v);
  }

  setRandomizer(
    layerKey: string,
    v: RandomizerTypeLayered | undefined
  ): Promise<UpdateResult<RandomizerTypeLayered | undefined>> {
    return this.setBase(layerKey, "randomizer", v);
  }
  setReadName(
    layerKey: string,
    v: string | undefined
  ): Promise<UpdateResult<string | undefined>> {
    return this.setBase(layerKey, "readName", v);
  }
  async setIfNotChanged(
    layerKey: string,
    newC: LayeredVoiceConfig,
    comp: LayeredVoiceConfig
  ): Promise<UpdateResult<LayeredVoiceConfig, LayeredVoiceConfig>> {
    const r = await this.collection.updateOne(
      {
        id: layerKey,
        ...$.flatten({ speech: comp }),
      },
      {
        $set: $.flatten(newC),
      }
    );

    if (!r.matchedCount) {
      return {
        type: "not matched",
      };
    }
    if (!r.result.ok) {
      throw new RepositoryError(`setIfNotChanged is failed`, r);
    }
    return {
      type: "ok",
      after: newC,
      before: comp,
    };
  }
}
export class MongoSimpleLayeredVoiceConfigRepository extends MongoLayeredVoiceConfigRepositoryInternal {}
interface MongoMemberLayeredVoiceConfigRepositoryConstructor {
  new (
    collection: Collection<MongoCollectionType>
  ): LayeredVoiceConfigRepository<[string, string]>;
}
type MongoMemberLayeredVoiceConfigRepositoryClass = {
  origin: MongoLayeredVoiceConfigRepositoryInternal;
};
export const MongoMemberLayeredVoiceConfigRepository: MongoMemberLayeredVoiceConfigRepositoryConstructor = (function (
  this: MongoMemberLayeredVoiceConfigRepositoryClass,
  collection: Collection<MongoCollectionType>
) {
  this.origin = new MongoLayeredVoiceConfigRepositoryInternal(collection);
} as unknown) as MongoMemberLayeredVoiceConfigRepositoryConstructor;
MongoMemberLayeredVoiceConfigRepository.prototype = Object.fromEntries(
  Object.getOwnPropertyNames(
    MongoLayeredVoiceConfigRepositoryInternal.prototype
  ).map((name) => {
    return [
      name,
      function (
        this: MongoMemberLayeredVoiceConfigRepositoryClass,
        k: string[],
        ...args: unknown[]
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
        return this.origin[name](k.join("."), ...args);
      },
    ];
  })
);
