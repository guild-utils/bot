import { Event, EventStore } from "klasa";
import { VoiceState } from "discord.js";

export default class extends Event {
  constructor(store: EventStore, file: string[], directory: string) {
    super(store, file, directory, {
      event: "voiceStateUpdate",
    });
  }
  run(oldState: VoiceState, newState: VoiceState): void {
    const channel = newState.channel;
    const human = channel?.members.find((e) => !e.user.bot);
    if (human) {
      return;
    }
    channel?.leave();
  }
}
