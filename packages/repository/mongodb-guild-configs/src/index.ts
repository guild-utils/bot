import {
  BasicBotConfigRepository,
  BasicBotConfig,
  languages,
  UpdateResult,
} from "domain_guild-configs";
import { RepositoryError } from "domain_repository-error";
import { Collection } from "mongodb";

export type RepositoryCollectionType = {
  prefix?: string;
  language?: string;
  disabledCommands?: string[];
};
export type DefaultRepositoryCollectionType = {
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

  async getPrefix(guild: string): Promise<string | undefined> {
    const obj = await this.get(guild);
    return obj.prefix;
  }
  async setPrefix(
    guild: string,
    prefix: string
  ): Promise<UpdateResult<string | undefined>> {
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
    if (!r.ok) {
      throw new RepositoryError(
        "mongo repository setPrefix failed.",
        r.lastErrorObject
      );
    }
    const rr = r.value?.prefix;
    return {
      type: rr === prefix ? "same" : "ok",
      before: rr,
      after: prefix,
    };
  }
  async getLanguage(
    guild: string
  ): Promise<keyof typeof languages | undefined> {
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
    if (!r.ok) {
      throw new RepositoryError(
        "mongo repository setLanguage failed.",
        r.lastErrorObject
      );
    }
    const rr = r.value?.language;

    const before = rr
      ? Object.keys(languages).includes(rr)
        ? (rr as keyof typeof languages)
        : this.defaultV.language
      : this.defaultV.language;
    return {
      type: rr === language ? "same" : "ok",
      before,
      after: language,
    };
  }
  async getDisabledCommands(guild: string): Promise<Set<string>> {
    const obj = await this.get(guild);
    return obj.disabledCommands;
  }
  async setDisabledCommands(
    guild: string,
    key: string[]
  ): Promise<UpdateResult<Set<string>, Set<string>>> {
    const r = await this.guilds.findOneAndUpdate(
      { id: guild },
      {
        $set: {
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
    if (!r.ok) {
      throw new RepositoryError(
        "mongo repository setDisabledCommands failed.",
        r.lastErrorObject
      );
    }
    const before = new Set(rr);
    return {
      type: "ok",
      before,
      after: new Set(key),
    };
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
    if (!r.ok) {
      throw new RepositoryError(
        "mongo repository addDisabledCommands failed.",
        r.lastErrorObject
      );
    }
    const before = new Set(rr);
    return {
      type: "ok",
      before,
      after: new Set([...before, key]),
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
    if (!r.ok) {
      throw new RepositoryError(
        "mongo repository removeDisabledCommands failed.",
        r.lastErrorObject
      );
    }
    const rr = r.value?.disabledCommands;
    const before = new Set(rr ?? this.defaultV.disabledCommands);
    const after = new Set(before);
    after.delete(key);
    return {
      type: "ok",
      before,
      after,
    };
  }
}
