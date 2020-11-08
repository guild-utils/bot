import { MongoClientOptions, MongoClient, Db } from "mongodb";
import { BotLogger } from "presentation_core";
export type Options = {
  connectionString?: string;
  user?: string;
  password?: string;
  host?: string;
  port?: string;
  db?: string;
  options?: MongoClientOptions;
};
export async function initDatabase(opt: Options): Promise<Db> {
  const connection: Options = Object.assign(
    {},
    {
      host: "localhost",
      port: "27017",
      db: "guj-main",
      options: {},
    },
    opt
  );

  // If full connection string is provided, use that, otherwise fall back to individual parameters
  const connectionString: string =
    connection.connectionString ||
    `mongodb://${
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      connection.user ? `${connection.user}:${connection.password!}@` : ""
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    }${connection.host!}:${connection.port!}/${connection.db!}`;
  BotLogger.info("Connecting to database: %s", connectionString);
  const options: MongoClientOptions = Object.assign(
    {},
    connection.options || {},
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  const mongoClient: MongoClient = await MongoClient.connect(
    connectionString,
    options
  );

  return mongoClient.db(connection.db);
}
