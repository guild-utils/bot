import { CommandEx } from "presentation_klasa-core-command-rewrite";
import { KlasaMessage } from "klasa";
import { User } from "discord.js";
import { MessageEmbed } from "discord.js";
import { inject, autoInjectable } from "tsyringe";
import { CommandStore } from "klasa";
import { Usecase as ConfigUsecase } from "domain_configs";
import * as LANG_KEYS from "../../lang_keys";
@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("ConfigRepository") private readonly repo: ConfigUsecase
  ) {
    super(store, file, directory);
  }
  async run(
    msg: KlasaMessage,
    [user]: [User?]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    user = user ?? msg.author;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const member = await msg.guild!.members.fetch(user);
    if (!member) {
      return null;
    }
    const ret = await this.repo.appliedVoiceConfigResolvedBy(
      member.guild.id,
      member.user.id,
      member.nickname ?? undefined,
      member.user.username
    );
    const readnameMention = await this.repo.getUserReadNameResolvedBy(
      member.guild.id,
      member.user.id,
      member.nickname ?? undefined,
      member.user.username
    );
    const embed = new MessageEmbed();
    function addField<K extends keyof typeof ret>(k: K) {
      embed.addField(`${k}(${ret[k].provider})`, ret[k].value ?? "-", true);
    }
    addField("allpass");
    addField("intone");
    addField("kind");
    addField("maxReadLimit");
    embed.addField(
      `readName[author](${ret["readName"].provider})`,
      ret["readName"].value ?? "-",
      true
    );
    embed.addField(
      `readName[mention](${readnameMention[1]})`,
      readnameMention[0] ?? "-",
      true
    );
    addField("speed");
    addField("threshold");
    addField("tone");
    addField("volume");
    embed.setColor(this.client.options.themeColor);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    embed.setFooter(msg.member!.displayName, msg.author.displayAvatarURL());
    embed.setAuthor(member.displayName, member.user.displayAvatarURL());
    embed.setTitle(msg.language.get(LANG_KEYS.APPLIED_VOICE_CONFIG_TITLE));
    embed.setTimestamp();
    return msg.sendEmbed(embed);
  }
}
