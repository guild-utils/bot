import { CommandBase } from "@guild-utils/command-base";
import { Message } from "discord.js";
import { EmbedWithExecutorType, executorFromMessage } from "protocol_util-djs";
import { getLangType } from "../../util/get-lang";

export class CommandInfo implements CommandBase {
  constructor(
    private readonly response: (lang: string) => EmbedWithExecutorType,
    private readonly getLang: getLangType
  ) {}
  async run(message: Message): Promise<void> {
    const lk = await this.getLang(message.guild?.id);

    await message.channel.send(this.response(lk)(executorFromMessage(message)));
  }
}
