import * as Domain from "domain_voice-configs";
import { Collection } from "mongodb";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recurseObject<R>(obj: any): R {
  if (obj === null) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any
    return undefined as any;
  } else if (typeof obj === "string") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any
    return toFullWidth(obj) as any;
  } else if (typeof obj !== "object") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unnecessary-type-assertion
    return obj as any;
  } else {
    if (obj instanceof Array) {
      for (const key of obj) {
        recurseObject(key);
      }
    } else {
      for (const key in obj) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (obj[key] === null) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          obj[key] = undefined;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } else if (typeof obj[key] === "object") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          recurseObject(obj[key]);
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return obj;
}
export declare type Dictionary = {
  before?: Domain.DictionaryEntryB[];
  main?: Record<string, Domain.DictionaryEntryA>;
  after?: Domain.DictionaryEntryB[];
  entry?: Domain.DictionaryEntryB;
};
interface DictionaryRepositoryCollectionType {
  id: string;
  speech?: { dictionary?: Dictionary };
}
export class MongoDictionaryRepository implements Domain.DictionaryRepository {
  constructor(
    private readonly guilds: Collection<DictionaryRepositoryCollectionType>
  ) {}

  private async getBase(
    guild: string,
    {
      before,
      after,
      main,
    }: {
      before: boolean;
      after: boolean;
      main: boolean;
    }
  ): Promise<Domain.Dictionary> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectionobj: any = {};
    if (before) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      projectionobj.before = 1;
    }
    if (after) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      projectionobj.after = 1;
    }
    if (main) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      projectionobj.main = 1;
    }
    const ret = await this.guilds.findOne(
      { id: guild },
      {
        projection: {
          speech: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            dictionary: projectionobj,
          },
        },
      }
    );
    if (!ret) {
      return {
        before: [],
        after: [],
        main: new Map<string, Domain.DictionaryEntryA>(),
      };
    }
    const speech = ret.speech;
    if (!speech) {
      return {
        before: [],
        after: [],
        main: new Map<string, Domain.DictionaryEntryA>(),
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dict = (speech as { dictionary?: Dictionary }).dictionary;
    if (!dict) {
      return {
        before: [],
        after: [],
        main: new Map<string, Domain.DictionaryEntryA>(),
      };
    }
    const afterobj = dict.after ?? [];
    const mainobj: Map<string, Domain.DictionaryEntryA> = new Map(
      Object.entries(recurseObject(dict.main) ?? {})
    );
    const beforeobj = dict.before ?? [];
    return {
      ...recurseObject({ after: afterobj, before: beforeobj }),
      main: mainobj,
    };
  }
  async getAll(guild: string): Promise<Domain.Dictionary> {
    const r = await this.getBase(guild, {
      before: true,
      after: true,
      main: true,
    });
    return r;
  }
  async getBefore(guild: string): Promise<Domain.DictionaryEntryB[]> {
    const r = await this.getBase(guild, {
      before: true,
      after: false,
      main: false,
    });
    return r.before;
  }
  async getMain(guild: string): Promise<Map<string, Domain.DictionaryEntryA>> {
    const r = await this.getBase(guild, {
      before: false,
      after: false,
      main: true,
    });
    return r.main;
  }
  async getAfter(guild: string): Promise<Domain.DictionaryEntryB[]> {
    const r = await this.getBase(guild, {
      before: false,
      after: true,
      main: false,
    });
    return r.after;
  }
  async removeAll(guild: string): Promise<void> {
    await this.guilds.updateOne(
      {
        id: guild,
      },
      {
        $unset: {
          "speech.dictionary": 1,
        },
      }
    );
  }

  private async removeBase(
    target: "before" | "after",
    guild: string,
    key: number
  ): Promise<Domain.DictionaryEntryB | undefined> {
    const r = await this.guilds.findOneAndUpdate(
      {
        id: guild,
      },
      [
        {
          $set: {
            [`speech.dictionary.${target}`]: {
              $concatArrays: [
                { $slice: [`$speech.dictionary.${target}`, key] },
                {
                  $slice: [
                    `$speech.dictionary.${target}`,
                    { $add: [1, key] },
                    { $size: `$speech.dictionary.${target}` },
                  ],
                },
              ],
            },
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
      {
        projection: {
          speech: {
            dictionary: {
              entry: {
                $arrayElemAt: [`$speech.dictionary.${target}`, key],
              },
            },
          },
        },
        upsert: true,
      }
    );
    const entry = r.value?.speech?.dictionary?.entry;
    if (!entry) {
      return undefined;
    }
    return recurseObject(entry);
  }
  async removeMain(
    guild: string,
    key: string
  ): Promise<undefined | Domain.DictionaryEntryA> {
    const r = await this.guilds.findOneAndUpdate(
      {
        id: guild,
      },
      {
        $unset: {
          [`speech.dictionary.main.${key}`]: 1,
        },
      },
      {
        projection: {
          speech: {
            dictionary: {
              main: {
                [key]: 1,
              },
            },
          },
        },
        upsert: true,
      }
    );
    const obj = r.value?.speech?.dictionary?.main;
    if (!obj) {
      return undefined;
    }
    return recurseObject(obj[key]);
  }
  async removeAfter(
    guild: string,
    key: number
  ): Promise<Domain.DictionaryEntryB | undefined> {
    return this.removeBase("after", guild, key);
  }
  async removeBefore(
    guild: string,
    key: number
  ): Promise<Domain.DictionaryEntryB | undefined> {
    return this.removeBase("before", guild, key);
  }
  async updateBase(
    target: "before" | "after",
    guild: string,
    key: number,
    to: Domain.DictionaryEntryB | string
  ): Promise<[Domain.DictionaryEntryB, Domain.DictionaryEntryB] | undefined> {
    const setQuery =
      typeof to === "string"
        ? {
            [`speech.dictionary.${target}.${key}.to`]: to,
          }
        : {
            [`speech.dictionary.${target}.${key}`]: to,
          };

    const r = await this.guilds.findOneAndUpdate(
      {
        id: guild,
      },
      {
        $set: setQuery,
      },
      {
        projection: {
          speech: {
            dictionary: {
              entry: {
                $arrayElemAt: [`speech.dictionary.${target}`, key],
                from: 1,
                to: 1,
              },
            },
          },
        },
        upsert: true,
      }
    );
    const from = r.value?.speech?.dictionary?.entry;
    if (!from) {
      return undefined;
    }
    return recurseObject([
      from,
      typeof to === "string" ? { from: from.from, to } : to,
    ]);
  }
  async updateMain(
    guild: string,
    key: string,
    entry: Domain.DictionaryEntryA
  ): Promise<[Domain.DictionaryEntryA | undefined, Domain.DictionaryEntryA]> {
    const r = await this.guilds.findOneAndUpdate(
      {
        id: guild,
      },
      {
        $set: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          [`speech.dictionary.main.${key}`]: JSON.parse(JSON.stringify(entry)),
        },
      },
      {
        projection: {
          [`speech.dictionary.main.${key}`]: 1,
        },
        upsert: true,
      }
    );
    const obj = r.value?.speech?.dictionary?.main;
    if (!obj) {
      return [undefined, entry];
    }
    return recurseObject([obj[key], entry]);
  }
  async updateAfter(
    guild: string,
    key: number,
    to: Domain.DictionaryEntryB
  ): Promise<[Domain.DictionaryEntryB, Domain.DictionaryEntryB] | undefined> {
    return this.updateBase("after", guild, key, to);
  }
  async updateBefore(
    guild: string,
    key: number,
    to: Domain.DictionaryEntryB
  ): Promise<[Domain.DictionaryEntryB, Domain.DictionaryEntryB] | undefined> {
    return this.updateBase("before", guild, key, to);
  }
  private async appendBase(
    target: "before" | "after",
    guild: string,
    entry: Domain.DictionaryEntryB,
    pos = -1
  ): Promise<Domain.DictionaryEntryB> {
    const r = await this.guilds.updateOne(
      { id: guild },
      {
        $push: {
          [`speech.dictionary.${target}`]: {
            $each: [entry],
            $position: pos,
          },
        },
      }
    );
    if (r.result.ok) {
      return recurseObject(entry);
    }
    throw new Error("appendBase failed");
  }
  async appendAfter(
    guild: string,
    entry: Domain.DictionaryEntryB,
    pos = -1
  ): Promise<Domain.DictionaryEntryB> {
    return this.appendBase("after", guild, entry, pos);
  }
  async appendBefore(
    guild: string,
    entry: Domain.DictionaryEntryB,
    pos = -1
  ): Promise<Domain.DictionaryEntryB> {
    return this.appendBase("before", guild, entry, pos);
  }
}
function toFullWidth(elm: string) {
  return elm.replace(/[A-Za-z0-9!-~]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });
}
