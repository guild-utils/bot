/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { KlasaClientOptions } from "klasa";
import { Intents } from "discord.js";
import {
  CommandDataCollectionProviderObject,
  CommandDataCollectionObject,
  ww,
  ja_JP,
} from "presentation_command-data-common";
import { CommandDataCollectionProxy } from "presentation_command-data-discord";
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
  providers: {
    default: ENV.GUILD_UTILS_J_PROVIDER,
    postgresql:
      ENV.GUILD_UTILS_J_PROVIDER === "postgresql"
        ? {
            host: ENV.POSTGRES_HOST,
            port: ENV.POSTGRES_PORT,
            database: ENV.POSTGRES_DATABASE,
            user: ENV.POSTGRES_USER,
            password: ENV.POSTGRES_PASSWORD,
            options: {
              max: ENV.POSTGRES_MAX,
              idleTimeoutMillis: ENV.POSTGRES_IDLE_TIMEOUT,
              connectionTimeoutMillis: 2000,
            },
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
  commandDataCollection: new CommandDataCollectionProxy(
    new CommandDataCollectionProviderObject({
      ww: new CommandDataCollectionObject([
        ...ww.Core,
        ...ww.MemberSettings,
        ww.userconf,
        ...ww.VoiceBasic,
        ...ww.VoiceDictionary,
      ]),
      ja_JP: new CommandDataCollectionObject([
        ...ja_JP.Core,
        ...ja_JP.MemberSettings,
        ja_JP.userconf,
        ...ja_JP.VoiceBasic,
        ...ja_JP.VoiceDictionary,
      ]),
    })
  ),
  themeColor: 0xffd700,
};
const rawtoken = process.env["GUILD_UTILS_J_MAIN_DISCORD_TOKEN"];
if (!rawtoken) {
  throw new Error("GUILD_UTILS_J_MAIN_DISCORD_TOKEN is not set.Please set!\n");
}
export const token: string = rawtoken;
