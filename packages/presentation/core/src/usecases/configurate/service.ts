import { BasicBotConfigRepository } from "domain_guild-configs";
import { ConfigurateUsecase } from "protocol_configurate-usecase";
import { ConfigPermissionChecker } from "../permissionChecker";
import { createCheckFunction } from "./util";
import setAction from "./actions/set";
import getAction from "./actions/get";
import resetAction, { DefaultsType } from "./actions/reset";
import removeAction from "./actions/remove";
import addAction from "./actions/add";

export function configurateUsecaseCore(
  basicBotConfig: BasicBotConfigRepository,
  permissionChecker: ConfigPermissionChecker,
  commandNames: Set<string>,
  defaults: DefaultsType
): ConfigurateUsecase {
  const { checkUpdate, checkGet } = createCheckFunction(permissionChecker);
  return {
    set: setAction(basicBotConfig, checkUpdate),
    add: addAction(basicBotConfig, commandNames, checkUpdate),
    get: getAction(basicBotConfig, checkGet),
    remove: removeAction(basicBotConfig, checkUpdate),
    reset: resetAction(basicBotConfig, checkUpdate, defaults),
  };
}
