import {
  ConfigurateUsecase,
  InvalidKeyError,
} from "protocol_configurate-usecase";
import { Repositorys } from "./util";
import {
  ConfigPermissionChecker,
  createCheckFunction,
} from "presentation_core";

import addAction from "./actions/add";
import getAction from "./actions/get";
import removeAction from "./actions/remove";
import resetAction from "./actions/reset";
import setAction from "./actions/set";

export function mainConfigurateUsecase(
  repo: Repositorys,
  permissionChecker: ConfigPermissionChecker
): ConfigurateUsecase {
  const { checkUpdate, checkGet } = createCheckFunction(permissionChecker);
  const set = setAction(repo, checkUpdate);
  return {
    add: addAction(),
    get: getAction(repo, checkGet),
    remove: removeAction(),
    reset: resetAction(set),
    set,
  };
}
function layeredConfigureUsecaseW<K extends keyof ConfigurateUsecase>(
  act: K,
  usecases: ConfigurateUsecase[]
) {
  return (
    ...args2: Parameters<ConfigurateUsecase[K]>
  ): ReturnType<ConfigurateUsecase[K]> => {
    for (const usecase of usecases) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-explicit-any
        return (usecase[act] as any)(...args2);
      } catch (e) {
        if (e instanceof InvalidKeyError) {
          continue;
        }
        throw e;
      }
    }
    const [, k] = args2;
    throw new InvalidKeyError(k);
  };
}
export function layeredConfigureUsecase(
  usecases: ConfigurateUsecase[]
): ConfigurateUsecase {
  return {
    add: layeredConfigureUsecaseW("add", usecases),
    get: layeredConfigureUsecaseW("get", usecases),
    remove: layeredConfigureUsecaseW("remove", usecases),
    reset: layeredConfigureUsecaseW("reset", usecases),
    set: layeredConfigureUsecaseW("set", usecases),
  };
}
