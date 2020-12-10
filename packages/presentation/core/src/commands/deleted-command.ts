import { CommandBase } from "@guild-utils/command-base";
import { getLangType } from "../util/get-lang";
import { Message, MessageEmbed } from "discord.js";

export class DeletedCommand implements CommandBase {
  constructor(
    private readonly embed: (lang: string) => MessageEmbed,
    private readonly getLang: getLangType
  ) {}
  async run(msg: Message): Promise<void> {
    await msg.channel.send(this.embed(await this.getLang(msg.guild?.id)));
  }
}
