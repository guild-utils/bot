import { BasicBotConfigRepository } from "domain_guild-configs";
import {
  ConfigurateUsecase,
  InvalidValueError,
} from "protocol_configurate-usecase";
import {
  CheckFunction,
  guildOnly,
  Pipelines,
  SetFunction,
  setWithRecord,
} from "../util";

export default function (
  basicBotConfig: BasicBotConfigRepository,
  checkUpdate: CheckFunction
): ConfigurateUsecase["set"] {
  const m: Record<string, SetFunction> = {
    prefix: async (t, v, exec) => {
      const guild = guildOnly(t, exec);
      await checkUpdate({ guild }, exec);
      if (typeof v === "string" || v === undefined) {
        return basicBotConfig
          .setPrefix(guild, v)
          .then(Pipelines.guildSingle(guild));
      }
      throw new InvalidValueError(v);
    },
    language: async (t, v, exec) => {
      const guild = guildOnly(t, exec);
      await checkUpdate({ guild }, exec);
      if (v === "ja_JP" || v === undefined) {
        return basicBotConfig
          .setLanguage(guild, v)
          .then(Pipelines.guildSingle(guild));
      }
      throw new InvalidValueError(v);
    },
    disabledCommands: async (t, v, exec) => {
      const guild = guildOnly(t, exec);
      await checkUpdate({ guild }, exec);
      const vv = Array.isArray(v) ? v : [v];
      if (vv.some((e) => typeof e !== "string") && v !== undefined) {
        throw new InvalidValueError(v);
      }
      return basicBotConfig
        .setDisabledCommands(guild, vv as string[])
        .then(Pipelines.guildSet(guild));
    },
  };
  return setWithRecord(m);
}
