import { Client, VoiceState } from "discord.js";
import Engine from "../text2speech/engine";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";
import { BotLogger } from "../loggers";
const Logger = BotLogger.child({ event: "forAutoDisconnect" });
export default function (
  client: Client,
  engine: Engine,
  dataStore: TextToSpeechTargetChannelDataStore
): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function run(
    oldState: VoiceState,
    newState: VoiceState
  ): Promise<void> {
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
    await engine.unregister(vc.guild.voice?.connection);
    vc.guild.voice?.connection?.disconnect();
    await dataStore.clearTextToSpeechTargetChannel(oldChannel.guild.id);
    vc.leave();
  }
  client.on("voiceStateUpdate", (old, cur) => {
    run(old, cur).catch((e) => Logger.error(e, "voiceStateUpdate"));
  });
}
