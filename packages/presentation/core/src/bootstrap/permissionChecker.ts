import { Client, Permissions, UserResolvable } from "discord.js";
import { SenderPermissionError } from "../errors/permission-error";
import { UnreachableMemberError } from "../errors/unreachable-error";
import {
  ConfigPermissionChecker,
  configPermissionCheckerFactory,
} from "../usecases/permissionChecker";
export function createConfigPermissionChecker(
  client: Client
): ConfigPermissionChecker {
  const cf = async (guild: string, user: UserResolvable): Promise<void> => {
    const guildObj = await client.guilds.fetch(guild);
    if (!guildObj) {
      throw new TypeError("Permission check failed caused guild unreachable.");
    }
    const memberObj = await guildObj.members.fetch(user);
    if (!memberObj) {
      throw new UnreachableMemberError(user, guildObj);
    }
    if (guildObj.ownerID === memberObj.id) {
      return;
    }
    if (!memberObj.permissions.has("MANAGE_GUILD")) {
      throw new SenderPermissionError(
        new Permissions("MANAGE_GUILD"),
        memberObj.permissions,
        guildObj
      );
    }
  };
  const cf2 = ([guild, user]: [string, string]) => cf(guild, user);
  const pc = configPermissionCheckerFactory(cf, cf2);
  return pc;
}
