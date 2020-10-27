import { BasicBotConfigRepository } from "domain_guild-configs";
import {
  ConfigurateUsecase,
  ExecutorType,
  TargetType,
} from "protocol_configurate-usecase";
import {
  CheckFunction,
  guildOnly,
  Pipelines,
  ResetFunction,
  resetWithRecord,
} from "../util";
export type DefaultsType = {
  prefix: string;
  language: "ja_JP";
  disabledCommands: string[];
};

export default function (
  basicBotConfig: BasicBotConfigRepository,
  checkUpdate: CheckFunction,
  defaults: DefaultsType
): ConfigurateUsecase["reset"] {
  async function check(t: TargetType, exec: ExecutorType) {
    const guild = guildOnly(t, exec);
    await checkUpdate({ guild }, exec);
    return guild;
  }
  const m: Record<string, ResetFunction> = {
    prefix: async (t, exec) => {
      const guild = await check(t, exec);
      return await basicBotConfig
        .setPrefix(guild, defaults.prefix)
        .then(Pipelines.guildSingle(guild));
    },
    language: async (t, exec) => {
      const guild = await check(t, exec);
      return await basicBotConfig
        .setLanguage(guild, defaults.language)
        .then(Pipelines.guildSingle(guild));
    },
    disabledCommands: async (t, exec) => {
      const guild = await check(t, exec);
      return await basicBotConfig
        .setDisabledCommands(guild, defaults.disabledCommands)
        .then(Pipelines.guildSet(guild));
    },
  };
  return resetWithRecord(m);
}
