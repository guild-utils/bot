import {
  ColorResolvable,
  GuildMember,
  Message,
  MessageEmbed,
  User,
} from "discord.js";
export type CreateEmbedWithMetaDataOpt = {
  member?: GuildMember | null;
  user: User;
  color: ColorResolvable;
  timestamp?: number | Date | undefined;
};
export function createEmbedWithMetaData(
  opt: CreateEmbedWithMetaDataOpt
): MessageEmbed {
  const embed = new MessageEmbed();
  embed.setFooter(
    opt.member?.displayName ?? opt.user.username,
    opt.user.displayAvatarURL()
  );
  embed.setTimestamp(opt.timestamp);
  embed.setColor(opt.color);
  return embed;
}
export type Executor = {
  member?: GuildMember | null;
  user: User;
};
export type EmbedWithExecutorType = (arg: Executor) => MessageEmbed;
export function runEmbedWithExecutor(
  f: EmbedWithExecutorType,
  message: Message
): Promise<Message> {
  return message.sendEmbed(f(executorFromMessage(message)));
}
export function executorFromMessage(message: Message): Executor {
  return { user: message.author, member: message.member };
}
