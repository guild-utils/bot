import { Event, EventStore } from "klasa";
import {
  MessageReaction,
  User,
  TextChannel,
  Message,
  MessageEmbed,
  GuildChannel,
} from "discord.js";
import { starBoard } from "../guild_settings_keys";
export default class extends Event {
  constructor(store: EventStore, file: string[], directory: string) {
    super(store, file, directory, {
      event: "messageReactionAdd",
    });
  }
  private pinTargets = ["\ud83d\udccd", "\ud83d\udccc"];

  private starTargets = ["\u2b50", "\ud83c\udf1f", "\ud83c\udf20"];

  async run(
    reactionp: Partial<MessageReaction>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _user: Partial<User>
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const targets = [...this.pinTargets, ...this.starTargets];
    if (reactionp.emoji) {
      if (!targets.includes(reactionp.emoji.name)) {
        return;
      }
    }
    // eslint-disable-next-line prettier/prettier,@typescript-eslint/no-non-null-assertion
    const reaction: MessageReaction = reactionp.partial
      ? await reactionp.fetch!()
      : (reactionp as MessageReaction);
    if (!reactionp.emoji && !targets.includes(reaction.emoji.name)) {
      return;
    }
    const msg = reaction.message;
    await Promise.all([this.pin(reaction, msg), this.star(reaction, msg)]);
  }
  async pin(reaction: MessageReaction, msg: Message): Promise<void> {
    if (!this.pinTargets.includes(reaction.emoji.name)) {
      return;
    }
    const member = msg.member;
    if (!member) {
      return;
    }
    await msg.pin();
  }
  async star(reaction: MessageReaction, msg: Message): Promise<void> {
    if (!this.starTargets.includes(reaction.emoji.name)) {
      return;
    }
    const settings = msg.guildSettings;
    const starChannelId: string | undefined = settings.get(starBoard);
    if (!starChannelId) {
      return;
    }
    const starChannelRaw:
      | GuildChannel
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      | undefined = reaction.message.guild!.channels.cache.get(starChannelId);
    if (!starChannelRaw || starChannelRaw.type !== "text") {
      await reaction.message.channel.send(
        "starBoard is invalid value! Please reconfigurate!"
      );
      return;
    }
    const starChannel: TextChannel = starChannelRaw as TextChannel;
    const embed = new MessageEmbed();
    const member = msg.member;
    if (!member) {
      return;
    }
    const sourceChannel = msg.channel as TextChannel;
    embed
      .setAuthor(
        member.displayName,
        member.user.avatarURL({ format: "jpg", dynamic: true }) ?? undefined
      )
      .setColor(0xffd700)
      .setTimestamp(msg.createdTimestamp)
      .setDescription(msg.content)
      .addField("original", `[jump!](${msg.url})`, true)
      .setFooter(sourceChannel.name);
    await starChannel.sendEmbed(embed);
  }
}
