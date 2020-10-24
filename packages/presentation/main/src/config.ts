/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { KlasaClientOptions } from "klasa";
import { Intents } from "discord.js";
import * as ENV from "./bootstrap/env";
import GuildConfigRepository from "presentation_guild-config-adapter";
import { CachedBasicConfigRepository } from "repository_cache-guild-configs";
export function config(repo: CachedBasicConfigRepository): KlasaClientOptions {
  return {
    disableMentions: "everyone",
    guildConfigRepository: new GuildConfigRepository(repo),
    consoleEvents: {
      debug: false,
      error: true,
      log: true,
      verbose: false,
      warn: true,
      wtf: true,
    },
    restTimeOffset: 50,
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
    themeColor: ENV.GUJ_THEME_COLOR,
  };
}
const rawtoken = process.env["GUILD_UTILS_J_MAIN_DISCORD_TOKEN"];
if (!rawtoken) {
  throw new Error("GUILD_UTILS_J_MAIN_DISCORD_TOKEN is not set.Please set!\n");
}
export const token: string = rawtoken;
