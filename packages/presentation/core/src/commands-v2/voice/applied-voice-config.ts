import { ColorResolvable, Message, User } from "discord.js";
import { MessageEmbed } from "discord.js";
import { Usecase as VoiceConfigUsecase } from "domain_voice-configs";
import { CommandBase } from "@guild-utils/command-base";
import { getLangType } from "../../util/get-lang";
export type CommandAppliedVoiceConfigResponses = {
  embedTitle: string;
};
export class CommandAppliedVoiceConfig implements CommandBase {
  constructor(
    private readonly repo: VoiceConfigUsecase,
    private readonly color: ColorResolvable,
    private readonly responses: (
      lang: string
    ) => CommandAppliedVoiceConfigResponses,
    private readonly getLang: getLangType
  ) {}
  async run(msg: Message, [user]: [User?]): Promise<void> {
    user = user ?? msg.author;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const member = await msg.guild!.members.fetch(user);
    if (!member) {
      return;
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
    embed.setColor(this.color);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    embed.setFooter(msg.member!.displayName, msg.author.displayAvatarURL());
    embed.setAuthor(member.displayName, member.user.displayAvatarURL());
    embed.setTitle(
      this.responses(await this.getLang(msg.guild?.id)).embedTitle
    );
    embed.setTimestamp();
    await msg.sendEmbed(embed);
  }
}
