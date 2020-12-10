import { Client, GuildMember, PartialGuildMember } from "discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { BotLogger } from "../loggers";
const regex = /［【\[(.*)\]】］.*/;
export default function (
  client: Client,
  basicBotConfig: BasicBotConfigRepository
): void {
  const f = async function (
    partialNewMember: GuildMember | PartialGuildMember
  ): Promise<void> {
    const newMember = partialNewMember.partial
      ? await partialNewMember.fetch()
      : partialNewMember;
    if (client.user?.id !== newMember.client.user?.id) {
      return;
    }
    const prefixWithDisplayName = regex.exec(newMember.displayName);
    if (!prefixWithDisplayName) {
      return;
    }
    await basicBotConfig.setPrefix(
      newMember.guild.id,
      prefixWithDisplayName[1]
    );
  };
  client.on("guildMemberUpdate", (oldMember, newMember) => {
    f(newMember).catch((e) => BotLogger.error(e));
  });
}
