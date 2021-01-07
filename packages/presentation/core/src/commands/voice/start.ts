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
import { Controller as BellbotController } from "protocol_bell";
export type CommandStartResponses = {
  userNotInVc(exec: Executor): MessageEmbed;
  notJoinable(exec: Executor, vc: VoiceChannel): MessageEmbed;
  success(
    exec: Executor,
    vc: VoiceChannel,
    tcs: (TextChannel | NewsChannel)[]
  ): MessageEmbed;
};
export class CommandStart implements CommandBase {
  constructor(
    private readonly engine: Engine,
    private readonly dataStore: TextToSpeechTargetChannelDataStore,
    private readonly controller: BellbotController,
    private readonly responses: (lang: string) => CommandStartResponses,
    private readonly getLang: getLangType
  ) {}
  public async run(msg: Message): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const guild = msg.guild!;
    const gid = guild.id;
    const vc = msg.member?.voice.channel;
    const exec: Executor = {
      user: msg.author,
      member: msg.member,
    };
    if (!vc) {
      await msg.channel.send(
        this.responses(await this.getLang(gid)).userNotInVc(exec)
      );
      return;
    }
    if (!vc.joinable) {
      await msg.channel.send(
        this.responses(await this.getLang(gid)).notJoinable(exec, vc)
      );
      return;
    }
    const conn = await vc.join();
    await this.controller.start(vc.id);
    await this.engine.register(conn);

    await this.dataStore.addTextToSpeechTargetChannel(gid, msg.channel.id);
    const tcs = await this.dataStore.getTextToSpeechTargetChannel(gid);

    await msg.channel.send(
      this.responses(await this.getLang(gid)).success(
        exec,
        vc,
        [...tcs].map(
          (e) => guild.channels.resolve(e) as TextChannel | NewsChannel
        )
      )
    );
  }
}
