import { Guild, GuildMemberResolvable, UserResolvable } from "discord.js";

export class UnreachableMemberError extends Error {
  constructor(
    public readonly member: GuildMemberResolvable | UserResolvable,
    public readonly place: Guild,
    message = "Member unreachable in guild"
  ) {
    super(message);
  }
}
