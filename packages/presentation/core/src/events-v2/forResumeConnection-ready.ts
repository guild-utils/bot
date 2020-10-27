import { VoiceChannel } from "discord.js";
import { Client } from "discord.js";

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
          return (e as VoiceChannel).join().catch(console.log);
        })
    );
  }
  client.on("ready", (): void => {
    run().catch(console.log);
  });
}
