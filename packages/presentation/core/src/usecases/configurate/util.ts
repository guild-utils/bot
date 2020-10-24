import { ContextError } from "@guild-utils/command-schema";
import { UpdateResult } from "domain_meta";
import {
  ConfigurateUsecase,
  ConfigurateUsecaseResultType,
  ExecutorType,
  GetResponseType,
  InvalidKeyError,
  TargetType,
} from "protocol_configurate-usecase";
import { ConfigPermissionChecker } from "../permissionChecker";

export function wrapVisual<T extends UpdateResult<AB>, AB>(
  f: (b: AB | undefined) => string
): (v: T) => T & { vbefore: string; vafter: string } {
  return (v) => ({
    ...v,
    vafter: f(v.after),
    vbefore: f(v.before),
  });
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _wrapVisualIdnInstance = wrapVisual<any, unknown>((e) =>
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  e == null ? "-" : `\`\`${e}\`\``
);
export function wrapVisualIdn<T extends UpdateResult<unknown>>(): (
  v: T
) => T & { vbefore: string; vafter: string } {
  return _wrapVisualIdnInstance;
}
export function wrapVisualArr<T extends UpdateResult<unknown[]>>(): (
  v: T
) => T & { vbefore: string; vafter: string } {
  return wrapVisual((e: unknown[] | undefined) =>
    !e
      ? "-"
      : e.length === 0
      ? "[]"
      : "[" +
        e
          .map((k) => (k == null ? "-" : `\`\`${Object.toString.call(k)}\`\``))
          .join(",") +
        "]"
  );
}
export function wrapVisualSet<T extends UpdateResult<Set<unknown>>>(): (
  v: T
) => T & { vbefore: string; vafter: string } {
  return wrapVisual((e: Set<unknown> | undefined) =>
    !e
      ? "-"
      : e.size === 0
      ? "[]"
      : "[" +
        [...e]
          .map((k) => (k == null ? "-" : `\`\`${Object.toString.call(k)}\`\``))
          .join(",") +
        "]"
  );
}
export function wrapGuild<T>(
  gid: string
): (r: T) => T & { kind: "guild"; kindValue: string } {
  return (r) => ({
    ...r,
    kind: "guild",
    kindValue: gid,
  });
}
export function wrapUser<T>(
  uid: string
): (r: T) => T & { kind: "user"; kindValue: string } {
  return (r) => ({
    ...r,
    kind: "user",
    kindValue: uid,
  });
}
export function wrapMember<T>(
  memid: [string, string]
): (r: T) => T & { kind: "member"; kindValue: [string, string] } {
  return (r) => ({
    ...r,
    kind: "member",
    kindValue: memid,
  });
}
export type CheckFunction = (
  target: {
    guild?: string;
    user?: string;
    member?: [string, string];
  },
  executor: {
    guild?: string;
    user: string;
  }
) => Promise<void>;
export function createCheckFunction(
  permissionChecker: ConfigPermissionChecker
): {
  checkGet: CheckFunction;
  checkUpdate: CheckFunction;
} {
  const checkGet = async (
    target: {
      guild?: string;
      user?: string;
      member?: [string, string];
    },
    executor: {
      guild?: string;
      user: string;
    }
  ) => {
    await permissionChecker({
      action: "get",
      target,
      executor,
    });
  };
  const checkUpdate = async (
    target: {
      guild?: string;
      user?: string;
      member?: [string, string];
    },
    executor: {
      guild?: string;
      user: string;
    }
  ) => {
    await permissionChecker({
      action: "update",
      target,
      executor,
    });
  };
  return { checkGet, checkUpdate };
}
export function guildOnly(t: TargetType, executor: ExecutorType): string {
  if (t == undefined || t.guild == undefined) {
    if (executor.guild) {
      return executor.guild;
    }
    throw new ContextError();
  }
  if (t.guild) {
    return t.guild;
  }
  throw new ContextError();
}
type ContextType = {
  guild: string | undefined;
  user: string;
};
export type GetFunction = (
  t: TargetType,
  ctx: ContextType
) => Promise<GetResponseType>;
export function getWithRecord(
  mapping: Record<string, GetFunction | undefined>
): ConfigurateUsecase["get"] {
  return (t, k, ctx) => {
    const f = mapping[k];
    if (f) {
      return f(t, ctx);
    }
    throw new InvalidKeyError(k);
  };
}
export type SetFunction = (
  t: TargetType,
  v: unknown,
  ctx: ContextType
) => Promise<ConfigurateUsecaseResultType>;
export function setWithRecord(
  mapping: Record<string, SetFunction | undefined>
): ConfigurateUsecase["set"] {
  return (t, k, v, ctx) => {
    const f = mapping[k];
    if (f) {
      return f(t, v, ctx);
    }
    throw new InvalidKeyError(k);
  };
}
export type ResetFunction = (
  t: TargetType,
  ctx: ContextType
) => Promise<ConfigurateUsecaseResultType>;
export function resetWithRecord(
  mapping: Record<string, ResetFunction | undefined>
): ConfigurateUsecase["reset"] {
  return (t, k, ctx) => {
    const f = mapping[k];
    if (f) {
      return f(t, ctx);
    }
    throw new InvalidKeyError(k);
  };
}
export type RemoveFunction = (
  t: TargetType,
  v: unknown,
  ctx: ContextType
) => Promise<ConfigurateUsecaseResultType>;
export function removeWithRecord(
  mapping: Record<string, RemoveFunction | undefined>
): ConfigurateUsecase["remove"] {
  return (t, k, v, ctx) => {
    const f = mapping[k];
    if (f) {
      return f(t, v, ctx);
    }
    throw new InvalidKeyError(k);
  };
}
export type AddFunction = (
  t: TargetType,
  v: unknown,
  ctx: ContextType
) => Promise<ConfigurateUsecaseResultType>;
export function addWithRecord(
  mapping: Record<string, AddFunction | undefined>
): ConfigurateUsecase["add"] {
  return (t, k, v, ctx) => {
    const f = mapping[k];
    if (f) {
      return f(t, v, ctx);
    }
    throw new InvalidKeyError(k);
  };
}
type GuildPipeLineResutType<T> = T & {
  kind: "guild";
  kindValue: string;
} & {
  vbefore: string;
  vafter: string;
};
type UserPipeLineResutType<T> = T & {
  kind: "user";
  kindValue: string;
} & {
  vbefore: string;
  vafter: string;
};
type MemberPipeLineResutType<T> = T & {
  kind: "member";
  kindValue: [string, string];
} & {
  vbefore: string;
  vafter: string;
};
export const Pipelines = {
  guildSingle<T extends UpdateResult<unknown>>(guild: string) {
    return (e: T): Promise<GuildPipeLineResutType<T>> =>
      Promise.resolve(e).then(wrapGuild(guild)).then(wrapVisualIdn());
  },
  guildSet<T extends UpdateResult<Set<unknown>>>(guild: string) {
    return (e: T): Promise<GuildPipeLineResutType<T>> =>
      Promise.resolve(e).then(wrapGuild(guild)).then(wrapVisualSet());
  },
  userSingle<T extends UpdateResult<unknown>>(user: string) {
    return (e: T): Promise<UserPipeLineResutType<T>> =>
      Promise.resolve(e).then(wrapUser(user)).then(wrapVisualIdn());
  },
  userSet<T extends UpdateResult<Set<unknown>>>(user: string) {
    return (e: T): Promise<UserPipeLineResutType<T>> =>
      Promise.resolve(e).then(wrapUser(user)).then(wrapVisualSet());
  },
  memberSingle<T extends UpdateResult<unknown>>(member: [string, string]) {
    return (e: T): Promise<MemberPipeLineResutType<T>> =>
      Promise.resolve(e).then(wrapMember(member)).then(wrapVisualIdn());
  },
  memberSet<T extends UpdateResult<Set<unknown>>>(member: [string, string]) {
    return (e: T): Promise<MemberPipeLineResutType<T>> =>
      Promise.resolve(e).then(wrapMember(member)).then(wrapVisualSet());
  },
};
