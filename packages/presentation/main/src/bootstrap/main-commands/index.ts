import * as RtlJa from "../../languages/ja-jp";
import { commandTextSupplier, getLangType } from "presentation_core";
import { Category, HelpEntry } from "presentation_core";
import { ColorResolvable } from "discord.js";
import { CommandBase } from "@guild-utils/command-base";
import {
  SimpleDictionaryActions,
  SimpleDictionaryCommand,
} from "../../commands/simple-dictionary";
import { MainDictionaryCommand } from "../../commands/main-dictionary";
import { DictionaryRepository } from "domain_voice-configs";
import {
  DictionaryCommand,
  DictionaryCommandResponses,
} from "../../commands/dictionary";
import { JumanppCommand } from "../../commands/jumanpp";
import { KuromojiCommand } from "../../commands/kuromoji";
import { IpadicFeatures, Tokenizer } from "kuromoji";
import { createEmbedWithMetaData } from "protocol_util-djs";
import {
  MainCommands,
  DictionaryCommands,
} from "protocol_command-schema-main-bootstrap";
import { RandomCommand } from "../../commands/random";
import { LayeredVoiceConfigRepository } from "domain_voice-configs-write";
import { Usecase as VoiceConfigUsecase } from "domain_voice-configs";
import { ConnectableObservableRxEnv } from "../../gui/pagination/action-pipeline";
import { simpleDictionaryLang } from "../../languages/ja-jp/simple-dictionary";
import { mainDictionaryLang } from "../../languages/ja-jp/main-dictionary";

export function categoryWords(
  color: ColorResolvable,
  resolverValue: Map<string, HelpEntry>,
  visualValueDesc: Map<string, HelpEntry>,
  visualValueSummary: Map<string, HelpEntry>
): Category {
  const embed = commandTextSupplier({
    ja_JP: RtlJa.categoryWordsEmbed(color, visualValueDesc),
  });
  const summary = commandTextSupplier({
    ja_JP: RtlJa.categoryWordsDescription(visualValueSummary),
  });
  return {
    type: "category",
    embed,
    summary,
    name: () => "Words",
    resolverValue,
  };
}
export type MainCommandOptions = {
  after: SimpleDictionaryActions;
  before: SimpleDictionaryActions;
  dictionary: DictionaryRepository;
  rxEnv: ConnectableObservableRxEnv;
  kuromoji: Tokenizer<IpadicFeatures>;
  getLang: getLangType;
  voiceConfigUsecase: VoiceConfigUsecase;
  memberVoiceConfig: LayeredVoiceConfigRepository<[string, string]>;
  color: ColorResolvable;
};

export function initDictionaryCommands(
  opt: MainCommandOptions
): Record<DictionaryCommands, CommandBase> {
  const color = opt.color;
  return {
    "after-dictionary": new SimpleDictionaryCommand(
      opt.after,
      opt.rxEnv,
      () => simpleDictionaryLang(color, "後辞書"),
      opt.getLang
    ),
    "before-dictionary": new SimpleDictionaryCommand(
      opt.before,
      opt.rxEnv,
      () => simpleDictionaryLang(color, "前辞書"),
      opt.getLang
    ),
    "main-dictionary": new MainDictionaryCommand(
      opt.dictionary,
      opt.rxEnv,
      () => mainDictionaryLang(color),
      opt.getLang
    ),
    dictionary: new DictionaryCommand(
      opt.dictionary,
      (): DictionaryCommandResponses => ({
        exportSuccess: (exec) =>
          createEmbedWithMetaData({ ...exec, color })
            .setTitle("成功")
            .setDescription("エクスポートが完了しました。"),
        clearSuccess: (exec) =>
          createEmbedWithMetaData({ ...exec, color })
            .setTitle("成功")
            .setDescription("全消去が完了しました。"),
        importSuccess: (exec) =>
          createEmbedWithMetaData({ ...exec, color })
            .setTitle("成功")
            .setDescription("インポートが完了しました。"),
        requireSubCommand: (exec) =>
          createEmbedWithMetaData({
            ...exec,
            color,
          })
            .setTitle("サブコマンド")
            .setDescription("サブコマンドを指定する必要があります。"),
      }),
      opt.getLang
    ),
    jumanpp: new JumanppCommand(),
    kuromoji: new KuromojiCommand(opt.kuromoji),
  };
}
export function initMainCommands(
  opt: MainCommandOptions
): Record<MainCommands, CommandBase> {
  return {
    ...initDictionaryCommands(opt),
    random: RandomCommand.create(
      opt.memberVoiceConfig,
      opt.voiceConfigUsecase,
      () => {
        return {
          success: (exec, ctx) =>
            createEmbedWithMetaData({
              ...exec,
              color: opt.color,
            }).setDescription(
              [
                "音声設定を更新しました。",
                ...(ctx.newRandomizerValue
                  ? ["新しいrandomizerの値:", ctx.newRandomizerValue]
                  : []),
                "",
                ...(ctx.oldRandomizerValue
                  ? ["古いrandomizerの値:", ctx.oldRandomizerValue]
                  : []),
              ].join("\n")
            ),
        };
      },
      opt.getLang
    ),
  };
}
