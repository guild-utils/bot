import { Monitor } from "klasa";
import { KlasaMessage } from "klasa";
import { text2speechTargetTextChannels } from "../guild_settings_keys";
import { MonitorStore } from "klasa";
import Engine, { VoiceKind } from "../text2speech/engine";
import { inject, autoInjectable } from "tsyringe";
import * as GUILD_MEMBER_SETTINGS from "../guild_member_settings_keys";
import * as GUILD_SETINGS from "../guild_settings_keys";
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
    @inject("engine") private readonly engine: Engine
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
      const member = message.guild?.members.resolve(m);
      return (
        member?.settings.get(GUILD_MEMBER_SETTINGS.text2speechReadName) ??
        member?.displayName ??
        ""
      );
    });
    if (markRegex.test(content)) {
      return;
    }
    content = content.replace(urlRegex, "\nURL省略\n");
    content = content.replace(/```.*```/g, "");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const kind: VoiceKind | undefined = message.member?.settings.get(
      GUILD_MEMBER_SETTINGS.text2speechKind
    );
    if (kind === undefined) {
      return;
    }

    let speed: number | undefined = message.member?.settings.get(
      GUILD_MEMBER_SETTINGS.text2speechSpeed
    );
    if (speed === undefined) {
      return;
    }
    if (speed < 0.5) {
      speed = 0.5;
    }

    const tone: number | undefined = message.member?.settings.get(
      GUILD_MEMBER_SETTINGS.text2speechTone
    );
    if (tone === undefined) {
      return;
    }
    const volume: number =
      message.member?.user.settings.get(
        GUILD_MEMBER_SETTINGS.text2speechVolume
      ) ?? 0;
    const readName: string | undefined = message.guildSettings.get(
      GUILD_SETINGS.text2speechReadName
    )
      ? message.member?.settings.get(
          GUILD_MEMBER_SETTINGS.text2speechReadName
        ) ?? message.member?.displayName
      : undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dictionaryB: [
      string,
      (string | undefined)?
    ][] = message.guildSettings.get(GUILD_SETINGS.text2speechDictionaryBefore);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dictionaryArr = message.guildSettings.get(
      GUILD_SETINGS.text2speechDictionary
    );
    const dictionary: {
      [k in string]: {
        k: string;
        v?: string;
        p?: string;
        p1?: string;
        p2?: string;
        p3?: string;
      };
    } = {};
    for (const entry of dictionaryArr) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      dictionary[entry.k] = entry;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dictionaryA: [
      string,
      (string | undefined)?
    ][] = message.guildSettings.get(GUILD_SETINGS.text2speechDictionaryAfter);

    const maxReadLimit: number = message.guildSettings.get(
      GUILD_SETINGS.text2speechMaxReadLimit
    );
    await this.engine.queue(message.guild.voice.connection, content, {
      kind,
      speed,
      tone,
      volume,
      readName,
      dictionaryB,
      dictionary,
      dictionaryA,
      maxReadLimit,
    });
  }
}
