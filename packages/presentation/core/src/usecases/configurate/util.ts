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
        e.map((k) => (k == null ? "-" : `\`\`${String(k)}\`\``)).join(",") +
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
          .map((k) => (k == null ? "-" : `\`\`${String(k)}\`\``))
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
function createCheckFunctionBase(
  act: "get" | "update",
  permissionChecker: ConfigPermissionChecker
): CheckFunction {
  return async (target, executor) => {
    await permissionChecker({
      action: act,
      target,
      executor,
    });
  };
}
export function createCheckFunction(
  permissionChecker: ConfigPermissionChecker
): {
  checkGet: CheckFunction;
  checkUpdate: CheckFunction;
} {
  const checkGet = createCheckFunctionBase("get", permissionChecker);
  const checkUpdate = createCheckFunctionBase("update", permissionChecker);
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
type Function2<R> = (t: TargetType, ctx: ContextType) => Promise<R>;
type Function3<R> = (t: TargetType, v: unknown, ctx: ContextType) => Promise<R>;
type UpdateFuncton2 = Function2<ConfigurateUsecaseResultType>;
type UpdateFuncton3 = Function3<ConfigurateUsecaseResultType>;
function mapAndApply2<R>(m: Record<string, Function2<R> | undefined>) {
  return (t: TargetType, k: string, ctx: ContextType) => {
    const f = m[k];
    if (f) {
      return f(t, ctx);
    }
    throw new InvalidKeyError(k);
  };
}
function mapAndApply3<R>(m: Record<string, Function3<R> | undefined>) {
  return (t: TargetType, k: string, v: unknown, ctx: ContextType) => {
    const f = m[k];
    if (f) {
      return f(t, v, ctx);
    }
    throw new InvalidKeyError(k);
  };
}
export type GetFunction = Function2<GetResponseType>;
export function getWithRecord(
  mapping: Record<string, GetFunction | undefined>
): ConfigurateUsecase["get"] {
  return mapAndApply2(mapping);
}
export type SetFunction = UpdateFuncton3;
export function setWithRecord(
  mapping: Record<string, SetFunction | undefined>
): ConfigurateUsecase["set"] {
  return mapAndApply3(mapping);
}
export type ResetFunction = UpdateFuncton2;
export function resetWithRecord(
  mapping: Record<string, ResetFunction | undefined>
): ConfigurateUsecase["reset"] {
  return mapAndApply2(mapping);
}
export type RemoveFunction = UpdateFuncton3;
export function removeWithRecord(
  mapping: Record<string, RemoveFunction | undefined>
): ConfigurateUsecase["remove"] {
  return mapAndApply3(mapping);
}
export type AddFunction = UpdateFuncton3;
export function addWithRecord(
  mapping: Record<string, AddFunction | undefined>
): ConfigurateUsecase["add"] {
  return mapAndApply3(mapping);
}
type PipeLineResultType<T, K, KV> = T & {
  kind: K;
  kindValue: KV;
} & {
  vbefore: string;
  vafter: string;
};
type PipeLineResultTypeS<T, K> = PipeLineResultType<T, K, string>;
type GuildPipeLineResutType<T> = PipeLineResultTypeS<T, "guild">;
type UserPipeLineResutType<T> = PipeLineResultTypeS<T, "user">;
type MemberPipeLineResutType<T> = PipeLineResultType<
  T,
  "member",
  [string, string]
>;
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
