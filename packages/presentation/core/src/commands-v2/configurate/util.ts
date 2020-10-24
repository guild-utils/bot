import { ContextError, PermissionError } from "@guild-utils/command-schema";
import { Message, MessageEmbed } from "discord.js";
import {
  ConfigurateUsecaseResultType,
  ConfigurateUsecaseResultTypeSingle,
  ExecutorType,
  InvalidKeyError,
  InvalidValueError,
  TargetType,
} from "protocol_configurate-usecase";
import { Executor } from "protocol_util-djs";

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
export type UpdateResultResponses = {
  single: (
    result: ConfigurateUsecaseResultTypeSingle,
    target: string,
    exec: Executor,
    nick: string,
    avatar?: string
  ) => MessageEmbed;
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
    ).forEach((e) => console.log(e.reason));
    return;
  } catch (e) {
    if (e instanceof PermissionError) {
      await message.channel.send(responses.permissionError(e, target, exec));
      return;
    }
    if (e instanceof ContextError) {
      await message.channel.send(responses.contextError(e, target, exec));
      return;
    }
    if (e instanceof InvalidKeyError) {
      await message.channel.send(responses.contextError(e, target, exec));
      return;
    }
  }
}
