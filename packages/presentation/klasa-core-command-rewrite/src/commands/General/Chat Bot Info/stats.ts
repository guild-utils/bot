import { CommandStore } from "klasa";
import { KlasaMessage } from "klasa";
import { Duration } from "klasa";
import { version as klasaVersion } from "klasa";
import { version as discordVersion } from "discord.js";
import { CommandEx } from "../../../commandEx";

export default class extends CommandEx {
  constructor(store: CommandStore, file: string[], directory: string) {
    super(store, file, directory);
  }

  async run(
    message: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    let [users, guilds, channels, memory] = [0, 0, 0, 0];

    if (this.client.shard) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const results: number[][] = await this.client.shard.broadcastEval(
        `[this.users.cache.size, this.guilds.cache.size, this.channels.cache.size, (process.memoryUsage().heapUsed / 1024 / 1024)]`
      );
      for (const result of results) {
        users += result[0];
        guilds += result[1];
        channels += result[2];
        memory += result[3];
      }
    }

    return message.sendCode(
      "asciidoc",
      message.language.get(
        "COMMAND_STATS",
        (memory || process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
        Duration.toNow(Date.now() - process.uptime() * 1000),
        (users || this.client.users.cache.size).toLocaleString(),
        (guilds || this.client.guilds.cache.size).toLocaleString(),
        (channels || this.client.channels.cache.size).toLocaleString(),
        klasaVersion,
        discordVersion,
        process.version,
        message
      )
    );
  }
}
