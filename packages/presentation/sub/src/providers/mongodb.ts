// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import { Provider, util } from "klasa";
import { ProviderStore } from "klasa";
import {
  Db,
  Collection,
  FilterQuery,
  ReplaceWriteOpResult,
  MongoClientOptions,
  MongoClient,
} from "mongodb";
// eslint-disable-next-line @typescript-eslint/unbound-method
const { mergeDefault, mergeObjects, isObject } = util;
export default class extends Provider {
  private mongodb!: Db;
  constructor(store: ProviderStore, file: string[], directory: string) {
    super(store, file, directory);
  }
  get db(): Db {
    return this.mongodb;
  }
  /* Table methods */

  async init(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const connection: MongoClientOptions & {
      user?: string;
      password?: string;
      host?: string;
      port?: string;
      db?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options?: Record<string, any>;
    } = mergeDefault(
      {
        host: "localhost",
        port: 27017,
        db: "guj-sub",
        options: {},
      },
      this.client.options.providers?.mongodb
    );

    // If full connection string is provided, use that, otherwise fall back to individual parameters
    const connectionString: string =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (this.client.options.providers?.mongodb?.connectionString as
        | string
        | undefined) ||
      `mongodb://${
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        connection.user ? `${connection.user}:${connection.password!}@` : ""
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      }${connection.host!}:${connection.port!}/${connection.db!}`;
    console.log(connectionString);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const options: MongoClientOptions = mergeObjects(connection.options || {}, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const mongoClient: MongoClient = await MongoClient.connect(
      connectionString,
      options
    );

    this.mongodb = mongoClient.db(connection.db);
  }
  get exec(): Db {
    return this.db;
  }

  async hasTable(table: string): Promise<boolean> {
    const collections = await this.db.listCollections().toArray();
    return collections.some((col: { name: string }) => col.name === table);
  }

  createTable(table: string): Promise<Collection<Record<string, unknown>>> {
    return this.db.createCollection(table);
  }

  deleteTable(table: string): Promise<boolean> {
    return this.db.dropCollection(table);
  }

  /* Document methods */

  getAll(table: string, filter = []): Promise<unknown[]> {
    if (filter.length)
      return this.db
        .collection(table)
        .find(
          { id: { $in: filter } },
          {
            projection: {
              _id: 0,
            },
          }
        )
        .toArray();
    return this.db
      .collection(table)
      .find(
        {},
        {
          projection: {
            _id: 0,
          },
        }
      )
      .toArray();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getKeys(table: string): Promise<any[]> {
    return this.db
      .collection(table)
      .find({}, { projection: { id: 1, _id: 0 } })
      .toArray();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  get(table: string, id: any): Promise<any> {
    return this.db.collection(table).findOne(resolveQuery(id));
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  async has(table: any, id: any): Promise<boolean> {
    return Boolean(await this.get(table, id));
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  getRandom(table: string): Promise<any> {
    return this.db
      .collection(table)
      .aggregate([{ $sample: { size: 1 } }])
      .next();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  create(table: string, id: any, doc = {}): Promise<any> {
    return this.db
      .collection(table)
      .insertOne(mergeObjects(this.parseUpdateInput(doc), resolveQuery(id)));
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  delete(table: string, id: any): Promise<any> {
    return this.db.collection(table).deleteOne(resolveQuery(id));
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  update(table: string, id: any, doc: any): Promise<any> {
    return this.db.collection(table).updateOne(resolveQuery(id), {
      $set: isObject(doc) ? flatten(doc) : parseEngineInput(doc),
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  replace(table: string, id: any, doc: any): Promise<ReplaceWriteOpResult> {
    return this.db
      .collection(table)
      .replaceOne(resolveQuery(id), this.parseUpdateInput(doc));
  }
}

const resolveQuery: (
  query: Record<string, unknown> | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => FilterQuery<any> = (query: Record<string, unknown> | string) =>
  isObject(query) ? (query as Record<string, unknown>) : { id: query };

function flatten(
  obj: Record<string, string | Record<string, string>>,
  path = ""
) {
  let output = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isObject(value))
      output = Object.assign(
        output,
        flatten(value as Record<string, string>, path ? `${path}.${key}` : key)
      );
    else output[path ? `${path}.${key}` : key] = value;
  }
  return output;
}

function parseEngineInput<U>(
  updated: { data: [string | number, U] }[]
): Record<string | number, U> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Object.assign(
    {},
    ...updated.map((entry) => ({ [entry.data[0]]: entry.data[1] }))
  );
}
