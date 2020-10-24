import { ColorResolvable } from "discord.js";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";
import { InstanceState } from "../instanceState";
import Engine from "../text2speech/engine";
import { Usecase as ConfigUsecase } from "domain_voice-configs";
import handleStartupMessage from "../monitors-v2/handleStartupMessage";
import text2speech from "../monitors-v2/text2speech";
import commandHandler, {
  CommandHandlerResponses,
} from "../monitors-v2/commandHandler";
import { Monitor } from "monitor-discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { MainParserContext } from "@guild-utils/command-parser";
import { CommandSchema } from "@guild-utils/command-schema";
export type CreateCoreMonitorEnv = {
  engine: Engine;
  usecase: ConfigUsecase;
  dataStore: TextToSpeechTargetChannelDataStore;
  instanceState: InstanceState;
  color: ColorResolvable;
  parser: (
    content: string,
    ctx: MainParserContext
  ) => Promise<
    [string, unknown[], Record<string, unknown>, CommandContext] | undefined
  >;
  commandResolver: (
    k: string
  ) => [CommandBase, CommandSchema | undefined] | undefined;
  repo: BasicBotConfigRepository;
  prefix: string;
  commandHandlerResponses: (lang: string) => CommandHandlerResponses;
};
export function createCoreMonitor(env: CreateCoreMonitorEnv): Set<Monitor> {
  return new Set([
    new handleStartupMessage(env.instanceState, env.color),
    new text2speech(env.engine, env.usecase, env.dataStore),
    new commandHandler(
      env.parser,
      env.commandResolver,
      env.repo,
      env.commandHandlerResponses,
      env.prefix
    ),
  ]);
}