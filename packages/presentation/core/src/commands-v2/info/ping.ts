import { CommandBase } from "@guild-utils/command-base";
import { Message, MessageEmbed } from "discord.js";
import { getLangType } from "../../util/get-lang";
import {
  EmbedWithExecutorType,
  Executor,
  executorFromMessage,
} from "protocol_util-djs";
export type CommandPingTexts = {
  ping: EmbedWithExecutorType;
  pingText: string;
  pingpong: (timestamp: number, ping: number, exec: Executor) => MessageEmbed;
  pingpongText: string;
};
export class CommandPing implements CommandBase {
  constructor(
    private readonly texts: (lang: string) => CommandPingTexts,
    private readonly getLang: getLangType
  ) {}
  async run(message: Message): Promise<void> {
    const lk = await this.getLang(message.guild?.id);
    const texts = this.texts(lk);
    const executor = executorFromMessage(message);
    const msg = await message.send(texts.pingText, texts.ping(executor));
    await msg.edit(
      texts.pingpongText,
      texts.pingpong(
        (msg.editedTimestamp || msg.createdTimestamp) -
          (message.editedTimestamp || message.createdTimestamp),
        Math.round(message.client.ws.ping),
        executor
      )
    );
  }
}
