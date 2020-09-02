import {
  BasicBotConfigRepository,
  BasicBotConfig,
  languages,
  UpdateResult,
} from "domain_guild-configs";
import { Collection } from "mongodb";

type RepositoryCollectionType = {
  prefix?: string;
  language?: string;
  disabledCommands?: string[];
};
type DefaultRepositoryCollectionType = {
  prefix: string;
  language: keyof typeof languages;
  disabledCommands: string[];
};
export class MongoBasicBotConfigRepository implements BasicBotConfigRepository {
  constructor(
    private readonly guilds: Collection<RepositoryCollectionType>,
    private readonly defaultV: DefaultRepositoryCollectionType
  ) {}
  async get(guild: string): Promise<BasicBotConfig> {
    const r = await this.guilds.findOne(
      { id: guild },
      {
        projection: {
          prefix: 1,
          language: 1,
          disabledCommands: 1,
        },
      }
    );
    const rr = Object.assign({}, this.defaultV, r);
    const lang: keyof typeof languages = Object.keys(languages).includes(
      rr.language
    )
      ? (rr.language as keyof typeof languages)
      : this.defaultV.language;
    return {
      prefix: rr.prefix,
      language: lang,
      disabledCommands: new Set(rr.disabledCommands),
    };
  }

  async getPrefix(guild: string): Promise<string> {
    const obj = await this.get(guild);
    return obj.prefix;
  }
  async setPrefix(
    guild: string,
    prefix: string
  ): Promise<UpdateResult<string>> {
    const r = await this.guilds.findOneAndUpdate(
      { id: guild },
      {
        $set: {
          prefix,
        },
      },
      {
        projection: {
          prefix: 1,
        },
        upsert: true,
      }
    );
    const rr = r.value?.prefix;
    if (rr == null) {
      throw new Error("mongo repository setPrefix failed.");
    }
    return {
      type: rr === prefix ? "same" : "ok",
      before: rr,
      after: prefix,
    };
  }
  async getLanguage(guild: string): Promise<keyof typeof languages> {
    const obj = await this.get(guild);
    return obj.language;
  }
  async setLanguage(
    guild: string,
    language: keyof typeof languages
  ): Promise<UpdateResult<keyof typeof languages>> {
    const r = await this.guilds.findOneAndUpdate(
      { id: guild },
      {
        $set: {
          language,
        },
      },
      {
        projection: {
          language: 1,
        },
        upsert: true,
      }
    );
    const rr = r.value?.language;
    if (!rr) {
      throw new Error("mongo repository setLanguage failed.");
    }
    const rrr = Object.keys(languages).includes(rr)
      ? (rr as keyof typeof languages)
      : this.defaultV.language;
    return {
      type: rr === language ? "same" : "ok",
      before: rrr,
      after: language,
    };
  }
  async getDisabledCommands(guild: string): Promise<Set<string>> {
    const obj = await this.get(guild);
    return obj.disabledCommands;
  }
  async addDisabledCommands(
    guild: string,
    key: string
  ): Promise<UpdateResult<Set<string>>> {
    const r = await this.guilds.findOneAndUpdate(
      { id: guild },
      {
        $addToSet: {
          disabledCommands: key,
        },
      },
      {
        projection: {
          disabledCommands: 1,
        },
        upsert: true,
      }
    );
    const rr = r.value?.disabledCommands;
    if (!rr) {
      throw new Error("mongo repository addDisabledCommands failed.");
    }
    const rrr = new Set(rr);
    return {
      type: "ok",
      before: rrr,
      after: new Set([...rrr, key]),
    };
  }
  async removeDisabledCommands(
    guild: string,
    key: string
  ): Promise<UpdateResult<Set<string>>> {
    const r = await this.guilds.findOneAndUpdate(
      { id: guild },
      {
        $pull: {
          disabledCommands: key,
        },
      },
      {
        projection: {
          disabledCommands: 1,
        },
        upsert: true,
      }
    );
    const rr = r.value?.disabledCommands;
    const rrr = new Set(rr ?? this.defaultV.disabledCommands);
    const rrrr = new Set(rrr);
    rrrr.delete(key);
    return {
      type: "ok",
      before: rrr,
      after: rrrr,
    };
  }
}
