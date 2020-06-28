import { KlasaClientOptions } from "klasa";
import { Intents } from "discord.js";

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
    default: process.env["PWRD_EVENT_PROVIDER"],
    postgresql:
      process.env["PWRD_EVENT_PROVIDER"] === "postgresql"
        ? {
            host: process.env["POSTGRESS_HOST"],
            port: process.env["POSTGRESS_PORT"],
            database: process.env["POSTGRESS_DATABASE"],
            user: process.env["POSTGRESS_USER"],
            password: process.env["POSTGRESS_PASSWORD"],
            options: {
              max: process.env["POSTGRESS_MAX"],
              idleTimeoutMillis:
                Number(process.env["POSTGRESS_IDLE_TIMEOUT"]) ?? 30000,
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
  prefix: "$",
  ws: {
    intents:
      Intents.FLAGS.DIRECT_MESSAGES |
      Intents.FLAGS.GUILD_MESSAGES |
      Intents.FLAGS.GUILDS |
      Intents.FLAGS.GUILD_VOICE_STATES,
  },
  production: process.env.NODE_ENV === "production",
};
const rawtoken = process.env["GUILD_UTILS_J_DISCORD_TOKEN"];
if (!rawtoken) {
  throw new Error("token GUILD_UTILS_J_DISCORD_TOKEN is not set");
}
export const token: string = rawtoken;
