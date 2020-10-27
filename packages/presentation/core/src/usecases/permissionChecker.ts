import { ContextError } from "@guild-utils/command-schema";
import { NotAllowedError } from "../errors/permission-error";

export interface PermissionChecker<Context> {
  (ctx: Context): Promise<void>;
}
export type ConfigPermissionChecker = PermissionChecker<{
  action: "get" | "update";
  target: {
    guild?: string;
    user?: string;
    member?: [string, string];
  };
  executor: {
    guild?: string;
    user: string;
  };
}>;
const configGetGuildCtx = (
  tguild: string | undefined,
  eguild: string | undefined
) => {
  if (eguild == undefined || tguild == undefined) {
    return;
  }
  if (tguild !== eguild) {
    throw new ContextError();
  }
  return;
};
const configUpdateGuildCtx = (
  tguild: string | undefined,
  eguild: string | undefined,
  euser: string,
  editableGuildConfig: (guild: string, user: string) => Promise<void>
): Promise<void> => {
  if (eguild == undefined || tguild == undefined) {
    return Promise.resolve();
  }
  if (tguild !== eguild) {
    throw new ContextError();
  }
  return editableGuildConfig(eguild, euser);
};
const configGetMemberCtx = (tguild: string, eguild: string | undefined) => {
  if (eguild == undefined || tguild == undefined) {
    return;
  }
  if (tguild !== eguild) {
    throw new ContextError();
  }
  return;
};
const configUpdateMemberCtx = async (
  [tguild, tuser]: [string, string],
  [eguild, euser]: [string | undefined, string],
  editableOtherMemberConfig: (executor: [string, string]) => Promise<void>
): Promise<void> => {
  if (eguild == undefined || tguild == undefined) {
    return;
  }
  if (tguild !== eguild) {
    throw new ContextError();
  }
  if (tuser === euser) {
    return Promise.resolve();
  }
  return editableOtherMemberConfig([eguild, euser]);
};
export function configPermissionCheckerFactory(
  editableGuildConfig: (guild: string, user: string) => Promise<void>,
  editableOtherMemberConfig: (executor: [string, string]) => Promise<void>
): ConfigPermissionChecker {
  const getConfigPermissionChecker: ConfigPermissionChecker = async ({
    target,
    executor,
    // eslint-disable-next-line @typescript-eslint/require-await
  }) => {
    configGetGuildCtx(target.guild, executor.guild);
    if (target.member) {
      configGetMemberCtx(target.member[0], executor.guild);
    }
    if (target.user && target.user !== executor.user) {
      throw new NotAllowedError();
    }
    return;
  };
  const updateConfigPermissionChecker: ConfigPermissionChecker = async ({
    target,
    executor,
  }): Promise<void> => {
    await configUpdateGuildCtx(
      target.guild,
      executor.guild,
      executor.user,
      editableGuildConfig
    );

    if (target.member) {
      await configUpdateMemberCtx(
        target.member,
        [executor.guild, executor.user],
        editableOtherMemberConfig
      );
    }
    if (target.user && target.user !== executor.user) {
      throw new NotAllowedError();
    }
    return;
  };
  return (ctx) => {
    switch (ctx.action) {
      case "get":
        return getConfigPermissionChecker(ctx);
      case "update":
        return updateConfigPermissionChecker(ctx);
    }
    throw new TypeError("Illegal action type");
  };
}
