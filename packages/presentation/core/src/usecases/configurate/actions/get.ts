import { BasicBotConfigRepository } from "domain_guild-configs";
import {
  ConfigurateUsecase,
  ExecutorType,
  TargetType,
} from "protocol_configurate-usecase";
import { CheckFunction, GetFunction, getWithRecord, guildOnly } from "../util";

export default function (
  basicBotConfig: BasicBotConfigRepository,
  checkGet: CheckFunction
): ConfigurateUsecase["get"] {
  async function check(t: TargetType, exec: ExecutorType) {
    const guild = guildOnly(t, exec);
    await checkGet({ guild }, exec);
    return guild;
  }
  const mapping: Record<string, GetFunction> = {
    prefix: async (t, exec) => {
      const guild = await check(t, exec);
      return { guild: await basicBotConfig.getPrefix(guild) };
    },
    language: async (t, exec) => {
      const guild = await check(t, exec);
      return { guild: await basicBotConfig.getLanguage(guild) };
    },
    disabledCommands: async (t, exec) => {
      const guild = await check(t, exec);
      return { guild: await basicBotConfig.getDisabledCommands(guild) };
    },
  };
  return getWithRecord(mapping);
}
