import { UpdateResult } from "domain_meta";
export type ConfigurateUsecaseKindType = "guild" | "member" | "user";
export type ConfigurateUsecaseResultTypeSingle = UpdateResult<unknown> & {
  kind: ConfigurateUsecaseKindType;
  kindValue: string | string[];
  vbefore: string | undefined;
  vafter: string | undefined;
};
export type ConfigurateUsecaseResultType =
  | ConfigurateUsecaseResultTypeSingle
  | ConfigurateUsecaseResultTypeSingle[];

export class InvalidKeyError extends TypeError {
  constructor(public readonly supplied: string) {
    super("Command failed. Cause invalid key.");
  }
}
export class InvalidValueError extends TypeError {
  constructor(public readonly supplied: unknown) {
    super("Command failed. Cause invalid value.");
  }
}
export type TargetType =
  | {
      guild?: string;
      user?: string;
      member?: [string, string];
    }
  | undefined;
export type ExecutorType = {
  guild: string | undefined;
  user: string;
};
export type GetResponseType = {
  guild?: unknown;
  user?: unknown;
  member?: unknown;
};
export interface ConfigurateUsecase {
  set(
    t: TargetType,
    k: string,
    v: unknown,
    ctx: {
      guild: string | undefined;
      user: string;
    }
  ): Promise<ConfigurateUsecaseResultType>;
  get(
    t: TargetType,
    k: string,
    ctx: {
      guild: string | undefined;
      user: string;
    }
  ): Promise<GetResponseType>;
  add(
    t: TargetType,
    k: string,
    v: unknown,
    executor: {
      guild: string | undefined;
      user: string;
    }
  ): Promise<ConfigurateUsecaseResultType>;
  remove(
    t: TargetType,
    k: string,
    v: unknown,
    executor: {
      guild: string | undefined;
      user: string;
    }
  ): Promise<ConfigurateUsecaseResultType>;
  reset(
    t: TargetType,
    k: string,
    ctx: {
      guild: string | undefined;
      user: string;
    }
  ): Promise<ConfigurateUsecaseResultType>;
}
