import { Event, EventStore } from "klasa";
import { VoiceState } from "discord.js";
import { inject, autoInjectable } from "tsyringe";
import Engine from "../text2speech/engine";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";

@autoInjectable()
export default class extends Event {
  constructor(
    store: EventStore,
    file: string[],
    directory: string,
    @inject("engine") private readonly engine: Engine,
    @inject("TextToSpeechTargetChannelDataStore")
    private readonly dataStore: TextToSpeechTargetChannelDataStore
  ) {
    super(store, file, directory, {
      event: "voiceStateUpdate",
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const oldChannel = oldState.channel;
    if (!oldChannel) {
      return;
    }
    if (newState.channel && newState.channelID === oldState.channelID) {
      return;
    }

    const vc = oldChannel.guild.voice?.channel;
    if (!vc || vc.id !== oldChannel.id) {
      return;
    }

    const inHuman = vc.members.some((e) => !e.user.bot);
    if (inHuman) {
      return;
    }
    await this.engine.unregister(vc.guild.voice?.connection);
    vc.guild.voice?.connection?.disconnect();
    await this.dataStore.clearTextToSpeechTargetChannel(oldChannel.guild.id);
    vc.leave();
  }
}
