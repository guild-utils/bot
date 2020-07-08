import { Monitor } from "klasa";
import { KlasaMessage } from "klasa";
import { text2speechTargetTextChannels } from "../guild_settings_keys";
import { MonitorStore } from "klasa";
import Engine, { VoiceKindArray, VoiceKind } from "../text2speech/engine";
import { inject, autoInjectable } from "tsyringe";
import * as GUILD_MEMBER_SETTINGS from "../guild_member_settings_keys";
import { Guild, User } from "discord.js";
import { Repository as ConfigRepository } from "domain_configs";
// eslint-disable-next-line no-useless-escape
const urlRegex = /https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/;
// eslint-disable-next-line no-useless-escape
const markRegex = /^[!"#$%&'()\*\+\-\.,\/:;<=>?\[\\\]^_`{|}~].*/;
function resolveUserNameFromGuildAndId(
  guild: Guild,
  user: User
): string | undefined {
  const member = guild.members.resolve(user);
  return (
    member?.settings.get(GUILD_MEMBER_SETTINGS.text2speechReadName) ??
    member?.nickname ??
    user.settings.get(GUILD_MEMBER_SETTINGS.text2speechReadName) ??
    user.username
  );
}
@autoInjectable()
export default class extends Monitor {
  constructor(
    store: MonitorStore,
    file: string[],
    directory: string,
    @inject("engine") private readonly engine: Engine,
    @inject("ConfigRepository") private readonly repo: ConfigRepository
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
    if (!message.guild) {
      return;
    }
    const targets: string[] = message.guildSettings.get(
      text2speechTargetTextChannels
    );
    if (!targets.includes(message.channel.id)) {
      return;
    }
    if (!message.guild.voice?.connection) {
      await message.guildSettings.reset(text2speechTargetTextChannels);
      return;
    }
    let content = message.content;
    if (content.startsWith(";")) {
      return;
    }
    // eslint-disable-next-line no-useless-escape
    content = content.replace(/\<\@\!?(\d+)\>/g, (e, m) => {
      const user = this.client.users.resolve(m);
      return (
        (message.guild &&
          user &&
          resolveUserNameFromGuildAndId(message.guild, user)) ||
        ""
      );
    });
    if (markRegex.test(content)) {
      return;
    }
    content = content.replace(urlRegex, "\nURL省略\n");
    content = content.replace(/```.*```/g, "");

    const config = await this.repo.appliedVoiceConfig(
      message.guild.id,
      message.author.id,
      message.member?.nickname ?? undefined,
      message.author.username
    );
    if (!(VoiceKindArray as string[]).includes(config.kind)) {
      config.kind = "mei_normal";
    }
    await this.engine.queue(message.guild.voice.connection, content, {
      dictionary: config.dictionary,
      kind: config.kind as VoiceKind,
      maxReadLimit: config.maxReadLimit,
      speed: config.speed,
      tone: config.tone,
      volume: config.volume,
      readName: config.readName === "" ? undefined : config.readName,
    });
  }
}
