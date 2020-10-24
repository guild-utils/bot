import Engine from "../../text2speech/engine";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";
import { CommandBase } from "@guild-utils/command-base";
import {
  Message,
  MessageEmbed,
  NewsChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getLangType } from "../../util/get-lang";
import { Executor } from "protocol_util-djs";
export type CommandEndChannelResponses = {
  success: (
    exec: Executor,
    place: TextChannel | NewsChannel,
    others: (TextChannel | NewsChannel)[],
    vc: VoiceChannel | undefined | null
  ) => MessageEmbed;
};
export class CommandEndChannel implements CommandBase {
  constructor(
    private readonly engine: Engine,
    private readonly dataStore: TextToSpeechTargetChannelDataStore,
    private readonly responses: (lang: string) => CommandEndChannelResponses,
    private readonly getLang: getLangType
  ) {}
  public async run(msg: Message): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const guild = msg.guild!;
    const gid = guild.id;
    await this.dataStore.removeTextToSpeechTargetChannel(gid, msg.channel.id);
    const tcs = await this.dataStore.getTextToSpeechTargetChannel(gid);
    if (tcs.size === 0) {
      await this.engine.unregister(guild.voice?.connection);
      guild.voice?.connection?.disconnect();
    }
    await msg.sendEmbed(
      this.responses(await this.getLang(guild.id)).success(
        {
          user: msg.author,
          member: msg.member,
        },
        msg.channel as TextChannel | NewsChannel,
        [...tcs].map(
          (e) => guild.channels.resolve(e) as TextChannel | NewsChannel
        ),
        tcs.size === 0 ? undefined : guild.voice?.channel
      )
    );
  }
}
