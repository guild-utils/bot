import { BasicBotConfigRepository } from "domain_guild-configs";
import {
  ConfigurateUsecase,
  InvalidValueError,
} from "protocol_configurate-usecase";
import {
  AddFunction,
  addWithRecord,
  CheckFunction,
  guildOnly,
  Pipelines,
} from "../util";

export default function (
  basicBotConfig: BasicBotConfigRepository,
  commandNames: Set<string>,
  checkUpdate: CheckFunction
): ConfigurateUsecase["add"] {
  const m: Record<string, AddFunction> = {
    disabledCommands: async (t, v, exec) => {
      const guild = guildOnly(t, exec);
      if (typeof v !== "string") {
        throw new InvalidValueError(v);
      }
      if (!commandNames.has(v)) {
        throw new InvalidValueError(v);
      }
      await checkUpdate({ guild }, exec);
      return await basicBotConfig
        .addDisabledCommands(guild, v)
        .then(Pipelines.guildSet(guild));
    },
  };
  return addWithRecord(m);
}
