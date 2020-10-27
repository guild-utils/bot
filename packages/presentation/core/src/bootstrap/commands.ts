import { CommandBase } from "@guild-utils/command-base";
import { ConfigurateUsecase } from "protocol_configurate-usecase";
import { CommandSet } from "../commands-v2/configurate/set";
import { CommandSchema, RateLimitEntry } from "@guild-utils/command-schema";
import * as Schemas from "protocol_command-schema-core";
import * as SchemaJa from "languages_command-core/ja-jp";
import { Client, ColorResolvable, Message, MessageEmbed } from "discord.js";
import { CommandAdd } from "../commands-v2/configurate/add";
import { CommandGet } from "../commands-v2/configurate/get";
import { CommandInvite } from "../commands-v2/info/invite";
import * as RtlJa from "../languages/ja-jp";
import { getLang as getLangBase, getLangType } from "../util/get-lang";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { CommandPing } from "../commands-v2/info/ping";
import { CommandRemove } from "../commands-v2/configurate/remove";
import { CommandReset } from "../commands-v2/configurate/reset";
import { CommandStats } from "../commands-v2/info/stats";
import { Category, CommandHelp, HelpEntry } from "../commands-v2/info/help";
import { CommandAppliedVoiceConfig } from "../commands-v2/voice/applied-voice-config";
import { CommandInfo } from "../commands-v2/info/info";
import { Usecase as VoiceConfigUsecase } from "domain_voice-configs";
import { CommandEnd } from "../commands-v2/voice/end";
import TTSEngine from "../text2speech/engine";
import { TextToSpeechTargetChannelDataStore as TTSDataStore } from "domain_guild-tts-target-channels";
import { CommandEndChannel } from "../commands-v2/voice/end-channel";
import { CommandSkip } from "../commands-v2/voice/skip";
import { CommandStart } from "../commands-v2/voice/start";
import {
  CommandConf,
  CommandMemconf,
  CommandMemconfMember,
  CommandUserconf,
} from "../commands-v2/configurate/conf";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { createRateLimitEntrys, RateLimitEntrys } from "../util/rate-limit";
export function schemaTextSupplier<T>(
  obj: Record<string, T>
): (lang: string, ctx?: Schemas.Context) => T {
  return (lang) => obj[lang];
}
export function commandTextSupplier<T>(
  obj: Record<string, T>
): (lang: string) => T {
  return (lang) => obj[lang];
}
export type CoreCommandOptions = {
  configurate: ConfigurateUsecase;
  color: ColorResolvable;
  rootCategory: Category;
  flatten: Map<string, HelpEntry>;
  voiceConfig: VoiceConfigUsecase;
  ttsEngine: TTSEngine;
  ttsDataStore: TTSDataStore;
  getLang: getLangType;
};

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
export function defineCoreCommandSchema(
  client: () => Client
): Record<CoreCommands, CommandSchema> {
  return {
    add: Schemas.commandAdd(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandAdd,
      }),
      client
    ),
    get: Schemas.commandGet(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandGet,
      }),
      client
    ),
    invite: Schemas.commandInvite(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandInvite,
      })
    ),
    ping: Schemas.commandPing(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandPing,
      })
    ),
    remove: Schemas.commandRemove(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandRemove,
      }),
      client
    ),
    reset: Schemas.commandReset(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandReset,
      }),
      client
    ),
    set: Schemas.commandSet(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandSet,
      }),
      client
    ),
    stats: Schemas.commandStats(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandStats,
      })
    ),
    info: Schemas.commandInfo(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandInfo,
      })
    ),
    help: Schemas.commandHelp(
      (lang, ctx): Record<"command" | "key", Schemas.DescriptionData> => {
        switch (lang) {
          case "ja_JP":
            return SchemaJa.commandHelp(ctx);
          default:
            throw new TypeError();
        }
      }
    ),
    "applied-voice-config": Schemas.commandAppliedVoiceConfig(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandAppliedVoiceConfig,
      }),
      client
    ),
    "end-channel": Schemas.commandEndChannel(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandEndChannel,
      })
    ),
    end: Schemas.commandEnd(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandEnd,
      })
    ),
    skip: Schemas.commandSkip(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandSkip,
      })
    ),
    start: Schemas.commandStart(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandStart,
      })
    ),
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
          memconf: Schemas.commandMemconf(
            schemaTextSupplier({
              ja_JP: SchemaJa.commandConf("メンバー設定を扱うコマンドです。"),
            })
          ),
          "memconf.member": Schemas.commandMemconfMember(
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
          conf: Schemas.commandConf(
            schemaTextSupplier({
              ja_JP: SchemaJa.commandConf("サーバー設定を扱うコマンドです。"),
            })
          ),
        }
      : {},
    use.user
      ? {
          uconf: Schemas.commandUserconf(
            schemaTextSupplier({
              ja_JP: SchemaJa.commandConf("ユーザー設定を扱うコマンドです。"),
            })
          ),
        }
      : {}
  );
}
export function initCoreCommands(
  injection: CoreCommandOptions
): Record<CoreCommands, CommandBase> {
  const { configurate, color, ttsEngine, ttsDataStore, getLang } = injection;
  const u = commandTextSupplier({
    ja_JP: RtlJa.rtlUpdate(injection.color),
  });
  return {
    add: new CommandAdd(configurate, u, getLang),
    get: new CommandGet(configurate, color),
    invite: new CommandInvite(
      color,
      commandTextSupplier({
        ja_JP: RtlJa.rtlInvite,
      }),
      getLang
    ),
    ping: new CommandPing(
      commandTextSupplier({
        ja_JP: RtlJa.rtlPing(color),
      }),
      getLang
    ),
    remove: new CommandRemove(configurate, u, getLang),
    reset: new CommandReset(configurate, u, getLang),
    set: new CommandSet(configurate, u, getLang),
    stats: new CommandStats(
      commandTextSupplier({
        ja_JP: RtlJa.statsEmbed,
      }),
      color,
      getLang
    ),
    info: new CommandInfo(
      commandTextSupplier({
        ja_JP: RtlJa.rtlInfo(color),
      }),
      getLang
    ),
    help: new CommandHelp(
      commandTextSupplier({
        ja_JP: RtlJa.rtlHelp(color),
      }),
      injection.rootCategory,
      injection.flatten,
      getLang
    ),
    "applied-voice-config": new CommandAppliedVoiceConfig(
      injection.voiceConfig,
      color,
      commandTextSupplier({
        ja_JP: {
          embedTitle: "読み上げの設定",
        },
      }),
      getLang
    ),
    "end-channel": new CommandEndChannel(
      ttsEngine,
      ttsDataStore,
      commandTextSupplier({
        ja_JP: {
          success: (exec, place, others, vc) => {
            if (others.length === 0) {
              return createEmbedWithMetaData({
                ...exec,
                color,
              })
                .setTitle("成功")
                .setDescription(
                  `読み上げ対象のテキストチャンネルがなくなったため${
                    vc ? vc.name + "での" : ""
                  }読み上げを終了しました。`
                );
            } else {
              const embed = createEmbedWithMetaData({
                ...exec,
                color,
              })
                .setTitle("成功")
                .setDescription(
                  `${place.toString()}の読み上げを終了しました。`
                );
              if (vc) {
                embed.addField("ボイスチャンネル", vc.name);
              }
              embed.addField(
                "テキストチャンネル",
                others.map((e) => e.toString()).join(" ")
              );

              return embed;
            }
          },
        },
      }),
      getLang
    ),
    end: new CommandEnd(
      ttsEngine,
      ttsDataStore,
      commandTextSupplier({
        ja_JP: {
          success: (exec, vc) => {
            const embed = createEmbedWithMetaData({
              ...exec,
              color,
            })
              .setTitle("成功")
              .setDescription(
                `${vc ? vc.name + "での" : ""}読み上げを終了しました。`
              );
            return embed;
          },
        },
      }),
      getLang
    ),
    skip: new CommandSkip(ttsEngine),
    start: new CommandStart(
      ttsEngine,
      ttsDataStore,
      commandTextSupplier({
        ja_JP: {
          notJoinable: (exec, vc) => {
            return createEmbedWithMetaData({
              ...exec,
              color,
            })
              .setTitle("失敗")
              .setDescription(`${vc.name}に接続することができません。`);
          },
          userNotInVc: (exec) => {
            return createEmbedWithMetaData({
              ...exec,
              color,
            })
              .setTitle("失敗")
              .setDescription("ユーザーがVCに接続していません。");
          },
          success: (exec, vc, tcs) => {
            const embed = createEmbedWithMetaData({
              ...exec,
              color,
            })
              .setTitle("成功")
              .setDescription(`読み上げを開始しました。`)
              .addField("ボイスチャンネル", vc.name)
              .addField(
                "テキストチャンネル",
                tcs.map((e) => e.toString()).join(" ")
              );
            return embed;
          },
        },
      }),
      getLang
    ),
  };
}
export type ConfCommands = "memconf" | "memconf.member" | "conf" | "uconf";
export type InitConfCommandArg = {
  usecase: ConfigurateUsecase;
  color: ColorResolvable;
  botConfig: BasicBotConfigRepository;
};
export function initConfCommand(
  use: Record<"guild" | "member" | "user", boolean>,
  { color, usecase, botConfig }: InitConfCommandArg
): Record<string, CommandBase | undefined> {
  const u = commandTextSupplier({
    ja_JP: RtlJa.rtlUpdate(color),
  });
  const getLang = getLangBase(botConfig, "ja_JP");
  return Object.assign(
    {},
    use.member
      ? {
          memconf: new CommandMemconf(usecase, u, color, getLang),
          "memconf.member": new CommandMemconfMember(
            usecase,
            u,
            color,
            getLang
          ),
        }
      : {},
    use.guild
      ? {
          conf: new CommandConf(usecase, u, color, getLang),
        }
      : {},
    use.user
      ? {
          uconf: new CommandUserconf(usecase, u, color, getLang),
        }
      : {}
  );
}
function isSetsEqual<A extends B, B>(a: Set<A>, b: Set<B>) {
  return a.size === b.size && [...a].every((value) => b.has(value));
}
export function createCommandCollectionWithAlias(
  commands: Record<string, CommandBase>,
  schemas: Record<string, CommandSchema>,
  lang: (
    lang: string
  ) => (
    e: RateLimitEntry,
    rt: number,
    schema: CommandSchema,
    message: Message
  ) => MessageEmbed
): Map<string, [CommandBase, CommandSchema, RateLimitEntrys]> {
  const ks = new Set(Object.keys(commands));
  if (!isSetsEqual(ks, new Set(Object.keys(schemas)))) {
    throw new TypeError();
  }
  const r = new Map<string, [CommandBase, CommandSchema, RateLimitEntrys]>();
  ks.forEach((e) => {
    const schema = schemas[e];
    const rles = createRateLimitEntrys(
      schema.options.rateLimits ?? new Set(),
      (l: string) => (e: RateLimitEntry, rt: number, message: Message) =>
        lang(l)(e, rt, schema, message)
    );
    [schema.name, ...(schema.options.alias ?? [])].forEach((k) => {
      r.set(k, [commands[e], schema, rles]);
    });
  });
  return r;
}
