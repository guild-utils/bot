import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { ContextError } from "@guild-utils/command-schema";
import { ColorResolvable, Message, User } from "discord.js";
import {
  ConfigurateUsecase,
  ConfigurateUsecaseResultType,
  TargetType,
} from "protocol_configurate-usecase";
import { getLangType } from "../../util/get-lang";
import { buildResponseWithSingleKey } from "./get";
import {
  buildTargetAndExecutor,
  ConfigCommandCommonOption,
  updateConfig,
  UpdateResultResponses,
} from "./util";
export type ActionType = "get" | "add" | "remove" | "reset" | "set";
export abstract class CommandConfBase implements CommandBase {
  constructor(
    private readonly usecase: ConfigurateUsecase,
    private readonly responses: (lang: string) => UpdateResultResponses,
    private readonly color: ColorResolvable,
    private readonly getLang: getLangType
  ) {}
  abstract run(
    message: Message,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    positional: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    option: Record<string, any>,
    ctx: CommandContext
  ): Promise<void>;
  protected async process(
    message: Message,
    [key, values]: [string, string | string[] | undefined],
    option: ConfigCommandCommonOption,
    target: TargetType,
    ctx: CommandContext
  ): Promise<void> {
    const { executor } = buildTargetAndExecutor(message, option);
    const actType = ctx.runningCommand[1];
    if (actType === "get") {
      const r = await this.usecase.get(target, key, executor);
      await message.channel.send(
        buildResponseWithSingleKey(key, r, {
          color: this.color,
          member: message.member,
          user: message.author,
          timestamp: Date.now(),
        })
      );
      return;
    }
    const action: Record<
      Exclude<ActionType, "get">,
      () => Promise<ConfigurateUsecaseResultType>
    > = {
      add: () =>
        this.usecase.add(
          target,
          key,
          Array.isArray(values) && values.length === 1 ? values[0] : values,
          executor
        ),
      remove: () =>
        this.usecase.remove(
          target,
          key,
          Array.isArray(values) && values.length === 1 ? values[0] : values,
          executor
        ),
      reset: () => this.usecase.reset(target, key, executor),
      set: () =>
        this.usecase.set(
          target,
          key,
          Array.isArray(values) && values.length === 1 ? values[0] : values,
          executor
        ),
    };
    await updateConfig(
      message,
      this.responses(await this.getLang(message.guild?.id)),
      key,
      action[actType]
    );
  }
}
export class CommandConf extends CommandConfBase {
  run(
    message: Message,
    args: [string, string | string[] | undefined],
    option: ConfigCommandCommonOption,
    ctx: CommandContext
  ): Promise<void> {
    const gid = message.guild?.id;
    if (!gid) {
      throw new ContextError();
    }
    return this.process(
      message,
      args,
      option,
      {
        guild: gid,
      },
      ctx
    );
  }
}
export class CommandMemconfMember extends CommandConfBase {
  run(
    message: Message,
    [user, key, values]: [User, string, string | string[] | undefined],
    option: ConfigCommandCommonOption,
    ctx: CommandContext
  ): Promise<void> {
    const gid = message.guild?.id;
    if (!gid) {
      throw new ContextError();
    }
    return this.process(
      message,
      [key, values],
      option,
      {
        member: [gid, user.id],
      },
      ctx
    );
  }
}
export class CommandMemconf extends CommandConfBase {
  run(
    message: Message,
    args: [string, string | string[] | undefined],
    option: ConfigCommandCommonOption,
    ctx: CommandContext
  ): Promise<void> {
    const gid = message.guild?.id;
    if (!gid) {
      throw new ContextError();
    }
    return this.process(
      message,
      args,
      option,
      {
        member: [gid, message.author.id],
      },
      ctx
    );
  }
}
export class CommandUserconf extends CommandConfBase {
  run(
    message: Message,
    args: [string, string | string[] | undefined],
    option: ConfigCommandCommonOption,
    ctx: CommandContext
  ): Promise<void> {
    return this.process(
      message,
      args,
      option,
      {
        user: message.author.id,
      },
      ctx
    );
  }
}
