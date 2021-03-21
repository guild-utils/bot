import { Client } from "discord.js";
import { BotLogger } from "../loggers";

async function doExitGuilds(client: Client) {
  await Promise.all(
    client.guilds.cache.map(async (guild) => {
      if (guild.voice) {
        return Promise.resolve();
      }
      try {
        await guild.leave();
      } catch (err) {
        BotLogger.error(err);
      }
    })
  );
}
export function scheduleExitGuilds(client: Client, time: number): void {
  setInterval(() => {
    if (time <= Date.now()) {
      doExitGuilds(client).catch((err) => BotLogger.error(err));
    }
  }, 60 * 1000);
}
