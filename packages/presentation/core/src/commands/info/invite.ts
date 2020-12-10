import { CommandBase } from "@guild-utils/command-base";
import { ColorResolvable, Message } from "discord.js";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { getLangType } from "../../util/get-lang";
export type CommandInviteTexts = {
  title: string;
  description: string;
};
export class CommandInvite implements CommandBase {
  constructor(
    private readonly color: ColorResolvable,
    private readonly texts: (lang: string) => CommandInviteTexts,
    private readonly getLang: getLangType
  ) {}
  async run(message: Message): Promise<void> {
    const embed = createEmbedWithMetaData({
      color: this.color,
      user: message.author,
      member: message.member,
    });
    const lk = await this.getLang(message.guild?.id);
    const texts = this.texts(lk);
    embed.setTitle(texts.title);
    embed.setDescription(texts.description);
    await message.channel.send(embed);
  }
}
