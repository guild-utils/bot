import { Client } from "discord.js";
import { MonitorRunner } from "monitor-discord.js";

export default function (client: Client, m: MonitorRunner): void {
  client.on("messageUpdate", (old, message) => {
    if (message.partial || old.content === message.content) {
      return;
    }
    m.edit(message);
  });
}
