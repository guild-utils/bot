import { Event, EventStore } from "klasa";
import { VoiceState } from "discord.js";
import { inject, autoInjectable } from "tsyringe";
import Engine from "../text2speech/engine";
import { text2speechTargetTextChannels } from "../guild_settings_keys";

@autoInjectable()
export default class extends Event {
  constructor(
    store: EventStore,
    file: string[],
    directory: string,
    @inject("engine") private readonly engine: Engine
  ) {
    super(store, file, directory, {
      event: "voiceStateUpdate",
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(oldState: VoiceState, _newState: VoiceState): Promise<void> {
    const oldChannel = oldState.channel;
    const inHuman = oldChannel?.members.some(
      (e) => !e.user.bot && e.user.id !== oldState.member?.user.id
    );
    if (inHuman) {
      return;
    }
    await this.engine.unregister(oldChannel?.guild!.voice?.connection);
    oldChannel?.guild!.voice?.connection?.disconnect();
    await oldChannel?.guild.settings.reset(
      text2speechTargetTextChannels.join(".")
    );
    oldChannel?.leave();
  }
}
