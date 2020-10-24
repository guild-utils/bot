/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Engine from "../../text2speech/engine";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";
import { CommandBase } from "@guild-utils/command-base";
import { Message, MessageEmbed, VoiceChannel } from "discord.js";
import { Executor } from "protocol_util-djs";
import { getLangType } from "../../util/get-lang";
export type CommandEndResponses = {
  success: (
    exec: Executor,
    vc: VoiceChannel | undefined | null
  ) => MessageEmbed;
};
export class CommandEnd implements CommandBase {
  constructor(
    private readonly engine: Engine,
    private readonly dataStore: TextToSpeechTargetChannelDataStore,
    private readonly responses: (lang: string) => CommandEndResponses,
    private readonly getLang: getLangType
  ) {}
  public async run(msg: Message): Promise<void> {
    const connection = msg.guild!.voice?.connection;
    await this.engine.unregister(connection);
    connection?.disconnect();
    await this.dataStore.clearTextToSpeechTargetChannel(msg.guild!.id);
    await msg.sendEmbed(
      this.responses(await this.getLang(msg.guild?.id)).success(
        {
          user: msg.author,
          member: msg.member,
        },
        connection?.channel
      )
    );
  }
}
