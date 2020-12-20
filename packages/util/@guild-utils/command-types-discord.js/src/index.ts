import type { Options, PositionalOptions } from "yargs";
import type { MainParserContext } from "@guild-utils/command-parser";
import type { Client, User, GuildMember, Channel } from "discord.js";
import {
  argumentTypeExtendedSymbols,
  ArgumentTypeMismatchError,
  Base,
  NotResolvableError,
} from "@guild-utils/command-types";
const MENTION_REGEX = {
  userOrMember: /^(?:<@!?)?(\d{17,19})>?$/,
  channel: /^(?:<#)?(\d{17,19})>?$/,
  emoji: /^(?:<a?:\w{2,32}:)?(\d{17,19})>?$/,
  role: /^(?:<@&)?(\d{17,19})>?$/,
  snowflake: /^(\d{17,19})$/,
};
export const memberSymbol = Symbol("member");
export class AT_Member extends Base<typeof memberSymbol, GuildMember> {
  name = "member";
  constructor(private readonly client: () => Client) {
    super();
  }
  resolverKey: typeof memberSymbol = memberSymbol;
  async resolve(v: unknown, ctx: MainParserContext): Promise<GuildMember> {
    if (typeof v !== "string") {
      throw new ArgumentTypeMismatchError();
    }
    const mr = v.match(MENTION_REGEX.userOrMember);
    if (!mr) {
      throw new ArgumentTypeMismatchError();
    }
    if (!ctx.guild) {
      throw new NotResolvableError();
    }
    const guild = await this.client().guilds.fetch(ctx.guild);
    if (!guild) {
      throw new NotResolvableError();
    }
    const member = await guild.members.fetch(mr[1]);
    if (!member) {
      throw new NotResolvableError();
    }
    return member;
  }
  yargs(): PositionalOptions & Options {
    return {
      type: "string",
    };
  }
}
export const userSymbol = Symbol("user");
export class AT_User extends Base<typeof userSymbol, User> {
  resolverKey: typeof userSymbol = userSymbol;
  name = "user";
  constructor(private readonly client: () => Client) {
    super();
  }
  async resolve(v: unknown): Promise<User> {
    if (typeof v !== "string") {
      throw new ArgumentTypeMismatchError();
    }
    const mr = v.match(MENTION_REGEX.userOrMember);
    if (!mr) {
      throw new ArgumentTypeMismatchError();
    }
    const user = await this.client().users.fetch(mr[1]);
    if (!user) {
      throw new NotResolvableError();
    }
    return user;
  }
  yargs(): PositionalOptions & Options {
    return {
      type: "string",
    };
  }
}
export const channelSymbol = Symbol("channel");
export class AT_Channel extends Base<typeof channelSymbol, Channel> {
  resolverKey: typeof channelSymbol = channelSymbol;
  name = "channel";
  constructor(private readonly client: () => Client) {
    super();
  }
  async resolve(v: unknown): Promise<Channel> {
    if (typeof v !== "string") {
      throw new ArgumentTypeMismatchError();
    }
    const c = v.match(MENTION_REGEX.channel);
    if (!c) {
      throw new ArgumentTypeMismatchError();
    }
    const r = await this.client().channels.fetch(c[1]);
    if (!r) {
      throw new NotResolvableError();
    }
    return r;
  }
  yargs(): PositionalOptions & Options {
    return {
      type: "string",
    };
  }
}
export const argumentTypeSymbolsWithDiscordJs = [
  memberSymbol,
  userSymbol,
  channelSymbol,
];
argumentTypeSymbolsWithDiscordJs.forEach((e) =>
  argumentTypeExtendedSymbols.add(e)
);
