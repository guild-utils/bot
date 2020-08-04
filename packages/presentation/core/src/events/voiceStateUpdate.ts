import { Event, EventStore } from "klasa";
import { VoiceState, VoiceChannel } from "discord.js";
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
  async run(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const oldChannel = oldState.channel;
    if (!oldChannel) {
      return;
    }
    if (newState.channel && newState.channelID === oldState.channelID) {
      return;
    }
    const vc: VoiceChannel | undefined = (await this.client.channels.fetch(
      oldChannel.id
    )) as VoiceChannel | undefined;
    if (!vc) {
      return;
    }

    const inHuman = vc.members.some((e) => !e.user.bot);
    if (inHuman) {
      return;
    }
    await this.engine.unregister(vc.guild.voice?.connection);
    vc.guild.voice?.connection?.disconnect();
    await vc.guild.settings.reset(text2speechTargetTextChannels.join("."));
    vc.leave();
  }
}
