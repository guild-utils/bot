import { KlasaClientOptions } from "klasa";
import { Intents } from "discord.js";
import GuildConfigRepository from "presentation_guild-config-adapter";
import { CachedBasicConfigRepository } from "repository_cache-guild-configs";
import {
  MongoBasicBotConfigRepository,
  RepositoryCollectionType,
} from "repository_mongo-guild-configs";
import * as ENV from "./bootstrap/env";

import { Collection } from "mongodb";
export function config(
  collection: Collection<RepositoryCollectionType>
): KlasaClientOptions {
  const prefix = process.env["GUJ_DEFAULT_PREFIX"] ?? "$.";
  const language = "ja_JP";
  return {
    disableMentions: "everyone",
    guildConfigRepository: new GuildConfigRepository(
      new CachedBasicConfigRepository(
        new MongoBasicBotConfigRepository(collection, {
          disabledCommands: [],
          language,
          prefix,
        })
      )
    ),
    consoleEvents: {
      debug: false,
      error: true,
      log: true,
      verbose: false,
      warn: true,
      wtf: true,
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
    prefix,
    restTimeOffset: 50,
    ws: {
      intents:
        Intents.FLAGS.DIRECT_MESSAGES |
        Intents.FLAGS.GUILD_MESSAGES |
        Intents.FLAGS.GUILDS |
        Intents.FLAGS.GUILD_VOICE_STATES,
    },
    disabledCorePieces: ["commands"],
    themeColor: ENV.GUJ_THEME_COLOR,
    production: process.env.NODE_ENV === "production",
  };
}
const rawtoken = process.env["GUILD_UTILS_J_SUB_DISCORD_TOKEN"];
if (!rawtoken) {
  throw new Error("GUILD_UTILS_J_SUB_DISCORD_TOKEN is not set.Please set!\n");
}
export const token: string = rawtoken;
