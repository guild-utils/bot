import { ContextError, PermissionError } from "@guild-utils/command-schema";
import {
  DMChannel,
  Message,
  MessageEmbed,
  NewsChannel,
  TextChannel,
} from "discord.js";
import {
  ConfigurateUsecaseResultType,
  ConfigurateUsecaseResultTypeSingle,
  ExecutorType,
  InvalidKeyError,
  InvalidValueError,
  TargetType,
} from "protocol_configurate-usecase";
import { Executor } from "protocol_util-djs";
import { CommandLogger } from "../../loggers";
const Logger = CommandLogger.child({ command: "configure" });
export type ConfigCommandCommonOption = {
  member: string | boolean;
  user: boolean;
  server: boolean;
};
export function buildTargetAndExecutor(
  message: Message,
  option: ConfigCommandCommonOption
): { target: TargetType; executor: ExecutorType } {
  return {
    target:
      !option.server && !option.member && !option.user
        ? undefined
        : {
            guild:
              typeof option.member === "string" ? undefined : message.guild?.id,
            member:
              typeof option.member === "string" && message.guild?.id
                ? ([message.guild.id, option.member] as [string, string])
                : undefined,
            user:
              typeof option.member === "string" ? undefined : message.author.id,
          },
    executor: {
      guild: message.guild?.id,
      user: message.author.id,
    },
  };
}
export type ErrorHandlerResponses = {
  permissionError: (
    error: PermissionError,
    target: string,
    exec: Executor
  ) => MessageEmbed;
  contextError: (
    error: ContextError,
    target: string,
    exec: Executor
  ) => MessageEmbed;
  invalidKeyError: (
    error: InvalidKeyError,
    target: string,
    exec: Executor
  ) => MessageEmbed;
  invalidValueError: (
    error: InvalidValueError,
    target: string,
    exec: Executor
  ) => MessageEmbed;
};
export type UpdateResultResponses = {
  single: (
    result: ConfigurateUsecaseResultTypeSingle,
    target: string,
    exec: Executor,
    nick: string,
    avatar?: string
  ) => MessageEmbed;
  subCommandNeeded: (exec: Executor) => MessageEmbed;
} & ErrorHandlerResponses;
async function buildResponseFromUpdateResultMulti(
  results: ConfigurateUsecaseResultTypeSingle[],
  responses: UpdateResultResponses,
  target: string,
  exec: Executor,
  message: Message
): Promise<MessageEmbed[]> {
  return Promise.all(
    results.map((e) => {
      return buildResponseFromUpdateResultSingle(
        e,
        responses,
        target,
        exec,
        message
      );
    })
  );
}
async function buildResponseFromUpdateResultSingle(
  src: ConfigurateUsecaseResultTypeSingle,
  responses: UpdateResultResponses,
  target: string,
  exec: Executor,
  message: Message
): Promise<MessageEmbed> {
  const client = message.client;
  switch (src.kind) {
    case "guild": {
      const guild = await client.guilds.fetch(src.kindValue as string);
      return responses.single(
        src,
        target,
        exec,
        guild.name,
        guild.iconURL() ?? undefined
      );
    }
    case "user": {
      const user = await client.users.fetch(src.kindValue as string);
      return responses.single(
        src,
        target,
        exec,
        user.tag,
        user.displayAvatarURL()
      );
    }
    case "member": {
      const memid = src.kindValue as [string, string];
      const member = await (await client.guilds.fetch(memid[0])).members.fetch(
        memid[1]
      );
      return responses.single(
        src,
        target,
        exec,
        member.displayName,
        member.user.displayAvatarURL()
      );
    }
  }
}
export async function buildResponseFromUpdateResult(
  src: ConfigurateUsecaseResultType,
  responses: UpdateResultResponses,
  target: string,
  exec: Executor,
  message: Message
): Promise<MessageEmbed[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
  if (Array.isArray(src)) {
    return buildResponseFromUpdateResultMulti(
      src,
      responses,
      target,
      exec,
      message
    );
  }

  return [
    await buildResponseFromUpdateResultSingle(
      src,
      responses,
      target,
      exec,
      message
    ),
  ];
}
export async function updateConfig(
  message: Message,
  responses: UpdateResultResponses,
  target: string,
  action: () => Promise<ConfigurateUsecaseResultType>
): Promise<void> {
  const exec = {
    user: message.author,
    member: message.member,
  };
  try {
    const actionResult = await action();
    const r = await Promise.allSettled(
      (
        await buildResponseFromUpdateResult(
          actionResult,
          responses,
          target,
          exec,
          message
        )
      ).map((e) => message.channel.send(e))
    );
    r.filter(
      (e): e is PromiseRejectedResult => e.status === "rejected"
    ).forEach((e) => Logger.error(e.reason));
    return;
  } catch (e) {
    if (await handleError(e, message.channel, responses, target, exec)) {
      return;
    }
    throw e;
  }
}
export async function handleError(
  e: unknown,
  channel: TextChannel | NewsChannel | DMChannel,
  responses: ErrorHandlerResponses,
  target: string,
  exec: Executor
): Promise<boolean> {
  if (e instanceof PermissionError) {
    await channel.send(responses.permissionError(e, target, exec));
    return true;
  }
  if (e instanceof ContextError) {
    await channel.send(responses.contextError(e, target, exec));
    return true;
  }
  if (e instanceof InvalidKeyError) {
    await channel.send(responses.invalidKeyError(e, target, exec));
    return true;
  }
  if (e instanceof InvalidValueError) {
    await channel.send(responses.invalidValueError(e, target, exec));
    return true;
  }

  return false;
}
export async function getEnviroment(
  action: () => Promise<void>,
  channel: TextChannel | NewsChannel | DMChannel,
  responses: ErrorHandlerResponses,
  target: string,
  exec: Executor
): Promise<void> {
  try {
    await action();
  } catch (e) {
    if (await handleError(e, channel, responses, target, exec)) {
      return;
    }
    throw e;
  }
}
