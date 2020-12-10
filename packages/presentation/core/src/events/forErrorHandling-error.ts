import { Client } from "discord.js";
import { BotLogger } from "../loggers";

export default function (client: Client): void {
  client.on("error", (err) => {
    BotLogger.fatal(err, "discordClient error occured.");
    setTimeout(() => {
      process.exit(1);
    }, 5);
  });
}
