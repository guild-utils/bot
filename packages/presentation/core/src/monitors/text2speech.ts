import { Monitor, KlasaMessage, MonitorStore } from "klasa";
import { inject, autoInjectable } from "tsyringe";
import Engine, { VoiceKindArray, VoiceKind } from "../text2speech/engine";
import * as GUILD_SETTINGS from "../guild_settings_keys";
import replaceAsync = require("string-replace-async");
import { Usecase as ConfigUsecase } from "domain_configs";
// eslint-disable-next-line no-useless-escape
const urlRegex = /https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/;
// eslint-disable-next-line no-useless-escape
const markRegex = /^[!"#$%&'()\*\+\-\.,\/:;<=>?\[\\\]^_`{|}~].*/;
@autoInjectable()
export default class extends Monitor {
  constructor(
    store: MonitorStore,
    file: string[],
    directory: string,
    @inject("engine") private readonly engine: Engine,
    @inject("ConfigRepository") private readonly repo: ConfigUsecase
  ) {
    super(store, file, directory, {
      name: "text2speech",
      enabled: true,
      ignoreBots: true,
      ignoreSelf: true,
      ignoreOthers: false,
      ignoreWebhooks: true,
      ignoreEdits: true,
      ignoreBlacklistedUsers: true,
      ignoreBlacklistedGuilds: true,
    });
  }

  async run(message: KlasaMessage): Promise<void> {
    const guild = message.guild;
    if (!guild) {
      return;
    }
    const targets: string[] = message.guildSettings.get(
      GUILD_SETTINGS.text2speechTargetTextChannels
    );
    if (!targets.includes(message.channel.id)) {
      return;
    }
    const connection = guild.voice?.connection;
    if (!connection) {
      await guild.settings.reset(GUILD_SETTINGS.text2speechTargetTextChannels);
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
      kind: config.kind as VoiceKind,
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
