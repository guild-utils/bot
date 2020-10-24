/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ClientOptions, Intents } from "discord.js";
export function config(): ClientOptions {
  return {
    disableMentions: "everyone",
    restTimeOffset: 50,
    /**
     * Console Options
     */
    partials: ["MESSAGE", "USER", "REACTION"],
    ws: {
      intents:
        Intents.FLAGS.DIRECT_MESSAGES |
        Intents.FLAGS.GUILD_MESSAGES |
        Intents.FLAGS.GUILDS |
        Intents.FLAGS.GUILD_VOICE_STATES |
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    },
  };
}
const rawtoken = process.env["GUILD_UTILS_J_MAIN_DISCORD_TOKEN"];
if (!rawtoken) {
  throw new Error("GUILD_UTILS_J_MAIN_DISCORD_TOKEN is not set.Please set!\n");
}
export const token: string = rawtoken;
