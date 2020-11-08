import { CommandBase } from "@guild-utils/command-base";
import {
  CommandSchema,
  PermissionError,
  RateLimitScope,
} from "@guild-utils/command-schema";
import { Message } from "discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { ResetTime } from "rate-limit";
import { CommandDisabledError } from "../errors/command-disabled-error";
import { RateLimitEntrys, RateLimitLangDescription } from "./rate-limit";
async function checkAuthoritySingle(
  k: string,
  msg: Message,
  authorityMap: Map<string, (msg: Message) => Promise<void>>
) {
  const f = authorityMap.get(k);
  if (!f) {
    throw new PermissionError("invalid command");
  }
  await f(msg);
}
async function checkAuthority(
  ks: Set<string> = new Set(),
  msg: Message,
  authorityMap: Map<string, (msg: Message) => Promise<void>>
) {
  await Promise.all(
    [...ks].map((k) => checkAuthoritySingle(k, msg, authorityMap))
  );
}
export type SubCommandProcessor<T> = (
  sub: (keyof T & string) | undefined | null,
  authorityMap: Map<string, (k: Message) => Promise<void>>
) => CommandBase["run"];
export function subCommandProcessor<T extends CommandBase>(
  base: T,
  defaultAction: CommandBase["run"],
  requiredPermissionsCollection: (k: string) => Set<string> | undefined,
  defaultRequiredPermissions?: Set<string> | undefined
): SubCommandProcessor<T> {
  return (sub, authorityMap) => {
    return async (msg, ...args) => {
      if (!sub) {
        await checkAuthority(defaultRequiredPermissions, msg, authorityMap);
        await defaultAction(msg, ...args);
        return;
      }
      const f = base[sub];
      if (typeof f !== "function") {
        return;
      }
      const requiredPermissions = requiredPermissionsCollection(sub);
      await checkAuthority(requiredPermissions, msg, authorityMap);
      await f.apply(base, args);
    };
  };
}
export async function checkSchema(
  schema: CommandSchema,
  repo: BasicBotConfigRepository,
  guild: string | undefined
): Promise<void> {
  if (guild) {
    const disabledCommands = await repo.getDisabledCommands(guild);
    if (disabledCommands.has(schema.name)) {
      throw new CommandDisabledError();
    }
  }
}
export async function checkRateLimit(
  message: Message,
  limitsRaw: RateLimitEntrys | undefined
): Promise<
  [RateLimitLangDescription, number, RateLimitEntrys[number]] | undefined
> {
  const limits = limitsRaw ?? [];
  const m: Record<RateLimitScope, unknown> = {
    channel: message.channel.id,
    guild: message.guild?.id ?? message.channel.id,
    member: (message.guild?.id ?? message.channel.id) + "." + message.author.id,
    user: message.author.id,
  };
  const r = await Promise.all(
    limits.map(
      async (
        entry
      ): Promise<
        [RateLimitLangDescription, [boolean, number], RateLimitEntrys[number]]
      > => {
        const [scp, lang, mgr] = entry;
        return [lang, await mgr.consume(m[scp]), entry];
      }
    )
  );
  const fr = r.filter(([, [e]]) => !e);
  if (fr.length === 0) {
    return undefined;
  }
  return fr
    .map(([lang, [, rt], entry]): [
      RateLimitLangDescription,
      ResetTime,
      RateLimitEntrys[number]
    ] => [lang, rt, entry])
    .reduce((a, e) => {
      return a[1] > e[1] ? a : e;
    });
}
