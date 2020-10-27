import { Client } from "discord.js";
import { MonitorRunner } from "monitor-discord.js";

export default function (client: Client, m: MonitorRunner): void {
  client.on("message", (message) => {
    m.create(message);
  });
}
