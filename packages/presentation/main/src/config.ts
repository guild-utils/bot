/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ClientOptions, Intents } from "discord.js";
export function config(): ClientOptions {
  return {
    allowedMentions: {
      parse: [],
    },
    restTimeOffset: 50,
    /**
     * Console Options
     */
    partials: ["MESSAGE", "USER", "REACTION"],
    intents:
      Intents.FLAGS.DIRECT_MESSAGES |
      Intents.FLAGS.GUILD_MESSAGES |
      Intents.FLAGS.GUILDS |
      Intents.FLAGS.GUILD_VOICE_STATES |
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    messageCacheLifetime: 60 * 10, //10min
    messageSweepInterval: 60, //1min
  };
}
const raw_token = process.env["GUILD_UTILS_J_MAIN_DISCORD_TOKEN"];
if (!raw_token) {
  throw new Error("GUILD_UTILS_J_MAIN_DISCORD_TOKEN is not set.Please set!\n");
}
export const token: string = raw_token;
