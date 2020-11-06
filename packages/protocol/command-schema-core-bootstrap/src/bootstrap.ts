import { CommandSchema } from "@guild-utils/command-schema";
import { Client } from "discord.js";
import { Context, DescriptionData } from "protocol_command-schema-core";
import {
  commandAdd,
  commandGet,
  commandRemove,
  commandReset,
  commandSet,
  commandMemconf,
  commandMemconfMember,
  commandConf,
  commandUserconf,
} from "protocol_command-schema-core";
import {
  commandInvite,
  commandPing,
  commandStats,
  commandInfo,
  commandHelp,
} from "protocol_command-schema-core";
import {
  commandAppliedVoiceConfig,
  commandEndChannel,
  commandEnd,
  commandSkip,
  commandStart,
} from "protocol_command-schema-core";
import * as SchemaJa from "languages_command-core/ja-jp";
export type BotInfoCommands = "invite" | "ping" | "stats" | "info" | "help";
export type ConfigurateCommands = "add" | "get" | "remove" | "reset" | "set";
export type VoiceCommands =
  | "applied-voice-config"
  | "end-channel"
  | "end"
  | "skip"
  | "start";
export type CoreCommands =
  | "add"
  | "get"
  | "invite"
  | "ping"
  | "remove"
  | "reset"
  | "set"
  | "stats"
  | "help"
  | "info"
  | "applied-voice-config"
  | "end-channel"
  | "end"
  | "skip"
  | "start";
export function schemaTextSupplier<T>(
  obj: Record<string, T>
): (lang: string, ctx?: Context) => T {
  return (lang) => obj[lang];
}
export function definedBotInfoCommandSchema(): Record<
  BotInfoCommands,
  CommandSchema
> {
  return {
    invite: commandInvite(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandInvite,
      })
    ),
    stats: commandStats(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandStats,
      })
    ),
    info: commandInfo(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandInfo,
      })
    ),
    help: commandHelp(
      (lang, ctx): Record<"command" | "key", DescriptionData> => {
        switch (lang) {
          case "ja_JP":
            return SchemaJa.commandHelp(ctx);
          default:
            throw new TypeError();
        }
      }
    ),
    ping: commandPing(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandPing,
      })
    ),
  };
}
export function defineConfigurateCommandSchema(
  client: () => Client
): Record<ConfigurateCommands, CommandSchema> {
  return {
    add: commandAdd(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandAdd,
      }),
      client
    ),
    get: commandGet(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandGet,
      }),
      client
    ),

    remove: commandRemove(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandRemove,
      }),
      client
    ),
    reset: commandReset(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandReset,
      }),
      client
    ),
    set: commandSet(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandSet,
      }),
      client
    ),
  };
}
export function definedVoiceCommandSchema(
  client: () => Client
): Record<VoiceCommands, CommandSchema> {
  return {
    "applied-voice-config": commandAppliedVoiceConfig(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandAppliedVoiceConfig,
      }),
      client
    ),
    "end-channel": commandEndChannel(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandEndChannel,
      })
    ),
    end: commandEnd(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandEnd,
      })
    ),
    skip: commandSkip(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandSkip,
      })
    ),
    start: commandStart(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandStart,
      })
    ),
  };
}
export function defineCoreCommandSchema(
  client: () => Client
): Record<CoreCommands, CommandSchema> {
  return {
    ...definedBotInfoCommandSchema(),
    ...defineConfigurateCommandSchema(client),
    ...definedVoiceCommandSchema(client),
  };
}
export function defineConfCommandSchema(
  use: Record<"guild" | "member" | "user", boolean>,
  client: () => Client
): Record<string, CommandSchema | undefined> {
  return Object.assign(
    {},
    use.member
      ? {
          memconf: commandMemconf(
            schemaTextSupplier({
              ja_JP: SchemaJa.commandConf("メンバー設定を扱うコマンドです。"),
            })
          ),
          "memconf.member": commandMemconfMember(
            schemaTextSupplier({
              ja_JP: SchemaJa.commandConf(
                "メンバー設定を扱うコマンドです。他のメンバーの設定を編集することもできます。"
              ),
            }),
            client
          ),
        }
      : {},
    use.guild
      ? {
          conf: commandConf(
            schemaTextSupplier({
              ja_JP: SchemaJa.commandConf("サーバー設定を扱うコマンドです。"),
            })
          ),
        }
      : {},
    use.user
      ? {
          userconf: commandUserconf(
            schemaTextSupplier({
              ja_JP: SchemaJa.commandConf("ユーザー設定を扱うコマンドです。"),
            })
          ),
        }
      : {}
  );
}
