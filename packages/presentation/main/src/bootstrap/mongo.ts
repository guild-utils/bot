import { MongoClientOptions, MongoClient, Db } from "mongodb";
import { KlasaClient } from "klasa";
import { util } from "klasa";
// eslint-disable-next-line @typescript-eslint/unbound-method
const { mergeDefault, mergeObjects } = util;
declare module "klasa" {
  interface KlasaClient {
    mongodb: Db;
  }
}
export async function initMongo(self: KlasaClient): Promise<void> {
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
      db: "guj-main",
      options: {},
    },
    self.options.providers?.mongodb
  );

  // If full connection string is provided, use that, otherwise fall back to individual parameters
  const connectionString: string =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (self.options.providers?.mongodb?.connectionString as string | undefined) ||
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

  self.mongodb = mongoClient.db(connection.db);
}
