import { Event, EventStore } from "klasa";
import { VoiceState } from "discord.js";

export default class extends Event {
  constructor(store: EventStore, file: string[], directory: string) {
    super(store, file, directory, {
      event: "voiceStateUpdate",
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run(oldState: VoiceState, _newState: VoiceState): void {
    const oldChannel = oldState.channel;
    const inHuman = oldChannel?.members.some(
      (e) => !e.user.bot && e.user.id !== oldState.member?.user.id
    );
    if (inHuman) {
      return
    }
    oldChannel?.leave();
  }
}
