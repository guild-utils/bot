import { CommandBase } from "@guild-utils/command-base";
import { Message } from "discord.js";
import { ConfigurateUsecase } from "protocol_configurate-usecase";
import { getLangType } from "../../util/get-lang";
import {
  buildTargetAndExecutor,
  ConfigCommandCommonOption,
  updateConfig,
  UpdateResultResponses,
} from "./util";

export class CommandAdd implements CommandBase {
  constructor(
    private readonly usecase: ConfigurateUsecase,
    private readonly responses: (lang: string) => UpdateResultResponses,
    private readonly getLang: getLangType
  ) {}
  async run(
    message: Message,
    [key, value]: [string, string],
    option: ConfigCommandCommonOption
  ): Promise<void> {
    const { target, executor } = buildTargetAndExecutor(message, option);
    await updateConfig(message, this.responses(await this.getLang()), key, () =>
      this.usecase.add(target, key, value, executor)
    );
  }
}
