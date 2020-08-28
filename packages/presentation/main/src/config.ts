/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { KlasaClientOptions } from "klasa";
import { Intents } from "discord.js";
import { ww, ja_JP } from "protocol_command-data-common";
import * as ENV from "./bootstrap/env";
export const config: KlasaClientOptions = {
  gateways: {},
  consoleEvents: {
    debug: false,
    error: true,
    log: true,
    verbose: false,
    warn: true,
    wtf: true,
  },
  restTimeOffset: 50,
  providers: {
    default: ENV.GUILD_UTILS_J_PROVIDER,
    mongodb:
      ENV.GUILD_UTILS_J_PROVIDER === "mongodb"
        ? {
            connectionString: ENV.MONGO_CONNECTION,
            host: ENV.MONGO_HOST,
            port: ENV.MONGO_PORT,
            db: ENV.MONGO_DB,
            user: ENV.MONGO_USER,
            password: ENV.MONGO_PASSWORD,
          }
        : undefined,
  },
  /**
   * Console Options
   */
  console: {
    // Alternatively a Moment Timestamp string can be provided to customize the timestamps.
    timestamps: true,
    utc: false,
    colors: {
      debug: { time: { background: "magenta" } },
      error: { time: { background: "red" } },
      log: { time: { background: "blue" } },
      verbose: { time: { text: "gray" } },
      warn: { time: { background: "lightyellow", text: "black" } },
      wtf: { message: { text: "red" }, time: { background: "red" } },
    },
  },
  language: "ja_JP",
  prefix: process.env["GUJ_DEFAULT_PREFIX"] ?? "$",
  partials: ["MESSAGE", "USER", "REACTION"],
  ws: {
    intents:
      Intents.FLAGS.DIRECT_MESSAGES |
      Intents.FLAGS.GUILD_MESSAGES |
      Intents.FLAGS.GUILDS |
      Intents.FLAGS.GUILD_VOICE_STATES |
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  },
  disabledCorePieces: ["commands"],
  production: process.env.NODE_ENV === "production",
  pieceDefaults: {
    commands: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      extendedHelp: false as any,
    },
  },
  allCommands: {
    ww: ww.All.filter((e) => e.receiver.includes("main")),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ja_JP: ja_JP.All.filter((e) =>
      e.receiver ? e.receiver.includes("main") : true
    ),
  },
  themeColor: ENV.GUJ_THEME_COLOR,
};
const rawtoken = process.env["GUILD_UTILS_J_MAIN_DISCORD_TOKEN"];
if (!rawtoken) {
  throw new Error("GUILD_UTILS_J_MAIN_DISCORD_TOKEN is not set.Please set!\n");
}
export const token: string = rawtoken;
