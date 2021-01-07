import { ClientOptions, Intents } from "discord.js";
export function config(): ClientOptions {
  return {
    allowedMentions: {
      parse: [],
    },
    restTimeOffset: 50,
    ws: {
      intents: Intents.FLAGS.GUILDS | Intents.FLAGS.GUILD_VOICE_STATES,
    },
    messageCacheLifetime: 60 * 10, //10min
    messageSweepInterval: 60, //1minc
    messageEditHistoryMaxSize: 0,
  };
}
const rawtoken = process.env["GUILD_UTILS_J_BELL_DISCORD_TOKEN"];
if (!rawtoken) {
  throw new Error("GUILD_UTILS_J_BELL_DISCORD_TOKEN is not set.Please set!\n");
}
export const token: string = rawtoken;
