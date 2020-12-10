import { MonitorBase } from "monitor-discord.js";
import Engine from "../text2speech/engine";
import replaceAsync = require("string-replace-async");
import { Usecase as ConfigUsecase } from "domain_voice-configs";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";
import { VoiceKindArray, VoiceKindType } from "domain_meta";
import { Message } from "discord.js";
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&/=]*)/;
// eslint-disable-next-line no-useless-escape
const markRegex = /^[!"#$%&'()\*\+\-\.,\/:;<=>?\[\\\]^_`{|}~].*/;
export default class extends MonitorBase {
  constructor(
    private readonly engine: Engine,
    private readonly repo: ConfigUsecase,
    private readonly dataStore: TextToSpeechTargetChannelDataStore
  ) {
    super({
      ignoreBots: true,
      ignoreSelf: true,
      ignoreOthers: false,
      ignoreWebhooks: true,
      ignoreEdits: true,
    });
  }

  async run(message: Message): Promise<void> {
    const guild = message.guild;
    if (!guild) {
      return;
    }
    const targets: Set<string> = await this.dataStore.getTextToSpeechTargetChannel(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      message.guild!.id
    );
    if (!targets.has(message.channel.id)) {
      return;
    }
    const connection = guild.voice?.connection;
    if (!connection) {
      await this.dataStore.clearTextToSpeechTargetChannel(guild.id);
      return;
    }
    let content = message.content;
    if (content.startsWith(";")) {
      return;
    }
    content = await replaceAsync(
      content,
      // eslint-disable-next-line no-useless-escape
      /\<\@\!?(\d+)\>/g,
      async (e, m: string): Promise<string> => {
        const member = await guild.members.fetch(m);
        if (!member) {
          return m;
        }
        const r = await this.repo.getUserReadName(
          guild.id,
          member.user.id,
          member.nickname ?? undefined,
          member.user.username
        );
        return r;
      }
    );
    if (markRegex.test(content)) {
      return;
    }
    content = content.replace(urlRegex, "\nURL省略\n");
    content = content.replace(/```.*```/g, "");

    const config = await this.repo.appliedVoiceConfig(
      guild.id,
      message.author.id,
      message.member?.nickname ?? undefined,
      message.author.username
    );
    if (!(VoiceKindArray as string[]).includes(config.kind)) {
      config.kind = "mei_normal";
    }
    await this.engine.queue(connection, content, {
      dictionary: config.dictionary,
      kind: config.kind as VoiceKindType,
      maxReadLimit: config.maxReadLimit,
      speed: config.speed,
      tone: config.tone,
      volume: config.volume,
      readName: config.readName === "" ? undefined : config.readName,
      allpass: config.allpass,
      intone: config.intone,
      threshold: config.threshold,
    });
  }
}
