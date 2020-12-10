import { CommandBase } from "@guild-utils/command-base";
import { ConfigurateUsecase } from "protocol_configurate-usecase";
import { CommandSet } from "../commands/configurate/set";
import { CommandSchema, RateLimitEntry } from "@guild-utils/command-schema";
import { ColorResolvable, Message, MessageEmbed } from "discord.js";
import { CommandAdd } from "../commands/configurate/add";
import { CommandGet } from "../commands/configurate/get";
import { CommandInvite } from "../commands/info/invite";
import * as RtlJa from "../languages/ja-jp";
import { getLang as getLangBase, getLangType } from "../util/get-lang";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { CommandPing } from "../commands/info/ping";
import { CommandRemove } from "../commands/configurate/remove";
import { CommandReset } from "../commands/configurate/reset";
import { CommandStats } from "../commands/info/stats";
import { Category, CommandHelp, HelpEntry } from "../commands/info/help";
import { CommandAppliedVoiceConfig } from "../commands/voice/applied-voice-config";
import { CommandInfo } from "../commands/info/info";
import { Usecase as VoiceConfigUsecase } from "domain_voice-configs";
import { CommandEnd } from "../commands/voice/end";
import TTSEngine from "../text2speech/engine";
import { TextToSpeechTargetChannelDataStore as TTSDataStore } from "domain_guild-tts-target-channels";
import { CommandEndChannel } from "../commands/voice/end-channel";
import { CommandSkip } from "../commands/voice/skip";
import { CommandStart } from "../commands/voice/start";
import {
  CommandConf,
  CommandMemconf,
  CommandMemconfMember,
  CommandUserconf,
} from "../commands/configurate/conf";
import { createEmbedWithMetaData } from "protocol_util-djs";
import { createRateLimitEntrys, RateLimitEntrys } from "../util/rate-limit";
import { CoreCommands } from "protocol_command-schema-core-bootstrap";
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

export function initCoreCommands(
  injection: CoreCommandOptions
): Record<CoreCommands, CommandBase> {
  const { configurate, color, ttsEngine, ttsDataStore, getLang } = injection;
  const u = commandTextSupplier({
    ja_JP: RtlJa.rtlUpdate(injection.color),
  });
  return {
    add: new CommandAdd(configurate, u, getLang),
    get: new CommandGet(configurate, color, u, getLang),
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
export type ConfCommands = "memconf" | "memconf.member" | "conf" | "userconf";
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
          userconf: new CommandUserconf(usecase, u, color, getLang),
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
