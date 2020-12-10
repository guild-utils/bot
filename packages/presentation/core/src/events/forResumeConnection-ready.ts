import { VoiceChannel } from "discord.js";
import { Client } from "discord.js";
import { BotLogger } from "../loggers";

export default function (client: Client): void {
  async function run(): Promise<void> {
    await Promise.all(
      client.channels.cache
        .filter((e): e is VoiceChannel => {
          return (
            e.type === "voice" &&
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (e as VoiceChannel).members.has(client.user!.id)
          );
        })
        .map((e) => {
          return (e as VoiceChannel).join().catch((e) => BotLogger.error(e));
        })
    );
  }
  client.on("ready", (): void => {
    run().catch((e) => BotLogger.error(e));
  });
}
