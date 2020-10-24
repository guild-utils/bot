import { BasicBotConfigRepository } from "domain_guild-configs";
import {
  ConfigurateUsecase,
  InvalidValueError,
} from "protocol_configurate-usecase";
import {
  CheckFunction,
  guildOnly,
  Pipelines,
  RemoveFunction,
  removeWithRecord,
} from "../util";

export default function (
  basicBotConfig: BasicBotConfigRepository,
  checkUpdate: CheckFunction
): ConfigurateUsecase["remove"] {
  const m: Record<string, RemoveFunction> = {
    disabledCommands: async (t, v, exec) => {
      const guild = guildOnly(t, exec);
      if (typeof v !== "string") {
        throw new InvalidValueError(v);
      }
      await checkUpdate({ guild }, exec);
      return await basicBotConfig
        .removeDisabledCommands(guild, v)
        .then(Pipelines.guildSet(guild));
    },
  };
  return removeWithRecord(m);
}
