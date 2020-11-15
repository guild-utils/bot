import { Message } from "discord.js";

export type DiscordContext = {
  messageId: string;
  channelId: string;
  channelName: string | null;
  chnnelType: "dm" | "news" | "text";
  guildId: string | null;
  guildName: string | null;
  userId: string;
  userName: string;
  nickName: string | null;
};
export function discordContextFromMessage(message: Message): DiscordContext {
  return {
    channelId: message.channel.id,
    channelName: message.channel.type !== "dm" ? message.channel.name : null,
    chnnelType: message.channel.type,
    guildId: message.guild?.id ?? null,
    guildName: message.guild?.name ?? null,
    messageId: message.id,
    nickName: message.member?.nickname ?? null,
    userId: message.author.id,
    userName: message.author.username,
  };
}
