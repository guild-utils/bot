import { Event, EventStore } from "klasa";
import { GuildMember } from "discord.js";
import { autoInjectable, inject } from "tsyringe";
import { BasicBotConfigRepository } from "domain_guild-configs";
@autoInjectable()
export default class extends Event {
  constructor(
    store: EventStore,
    file: string[],
    directory: string,
    @inject("BasicBotConfigRepository")
    private readonly basicBotConfig: BasicBotConfigRepository
  ) {
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
    await this.basicBotConfig.setPrefix(
      newMember.guild.id,
      prefixWithDisplayName[1]
    );
  }
}
