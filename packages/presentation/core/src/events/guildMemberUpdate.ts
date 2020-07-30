import { Event, EventStore } from "klasa";
import { GuildMember } from "discord.js";

export default class extends Event {
  constructor(store: EventStore, file: string[], directory: string) {
    super(store, file, directory, {
      event: "guildMemberUpdate",
    });
  }
  private readonly regex = /\[(.*)\].*/;
  async run(_oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (this.client.user?.id !== newMember.client.user?.id) {
      return;
    }
    const prefixWithDisplayName = this.regex.exec(newMember.displayName);
    if (!prefixWithDisplayName) {
      return;
    }
    await newMember.guild.settings.update("prefix", prefixWithDisplayName[1]);
  }
}
