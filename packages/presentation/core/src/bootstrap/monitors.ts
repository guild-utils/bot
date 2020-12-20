import { ColorResolvable } from "discord.js";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";
import { InstanceState } from "../util/instance-state";
import Engine from "../text2speech/engine";
import { Usecase as ConfigUsecase } from "domain_voice-configs";
import handleStartupMessage from "../monitors/handleStartupMessage";
import text2speech from "../monitors/text2speech";
import commandHandler, { CommandResolver } from "../monitors/commandHandler";
import { Monitor } from "monitor-discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { CommandContext } from "@guild-utils/command-base";
import { MainParserContext, SpecialInfo } from "@guild-utils/command-parser";
import { getLangType } from "../util/get-lang";
import { commandTextSupplier } from "./commands";
import { CommandHandlerJaJP } from "../languages/ja-jp/commandHandler";
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
    | [string, unknown[], Record<string, unknown>, CommandContext, SpecialInfo]
    | undefined
  >;
  commandResolver: CommandResolver;
  repo: BasicBotConfigRepository;
  prefix: string;
  getLang: getLangType;
};
export function createCoreMonitor(env: CreateCoreMonitorEnv): Set<Monitor> {
  return new Set([
    new handleStartupMessage(env.instanceState, env.color),
    new text2speech(env.engine, env.usecase, env.dataStore),
    new commandHandler(
      env.parser,
      env.commandResolver,
      env.repo,
      commandTextSupplier({
        ja_JP: CommandHandlerJaJP(env.color),
      }),
      env.prefix,
      env.getLang
    ),
  ]);
}
