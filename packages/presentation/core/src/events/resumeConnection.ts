import { Event, EventStore } from "klasa";
import { VoiceChannel } from "discord.js";

export default class extends Event {
  constructor(store: EventStore, file: string[], directory: string) {
    super(store, file, directory, {
      event: "ready",
    });
  }
  async run(): Promise<void> {
    await Promise.all(
      this.client.channels.cache
        .filter((e): e is VoiceChannel => {
          return (
            e.type === "voice" &&
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (e as VoiceChannel).members.has(this.client.user!.id)
          );
        })
        .map((e) => {
          return (e as VoiceChannel).join().catch(console.log);
        })
    );
  }
}
