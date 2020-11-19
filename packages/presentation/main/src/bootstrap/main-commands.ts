import * as RtlJa from "../languages-v2/ja-jp";
import { commandTextSupplier, getLangType } from "presentation_core";
import {
  Category,
  HelpEntry,
} from "presentation_core/dist/commands-v2/info/help";
import { ColorResolvable } from "discord.js";
import { CommandBase } from "@guild-utils/command-base";
import {
  PageValue as SimplePageValue,
  SimpleDictionaryActions,
  SimpleDictionaryCommand,
  SimpleDictionaryCommandResponses,
} from "../commands-v2/simple-dictionary";
import { PageValue as MainPageValue } from "../commands-v2/main-dictionary";
import { MainDictionaryCommand } from "../commands-v2/main-dictionary";
import { CtxBase, PaginationGui } from "../gui/pagination";
import { DictionaryRepository } from "domain_voice-configs";
import {
  DictionaryCommand,
  DictionaryCommandResponses,
} from "../commands-v2/dictionary";
import { JumanppCommand } from "../commands-v2/jumanpp";
import { KuromojiCommand } from "../commands-v2/kuromoji";
import { IpadicFeatures, Tokenizer } from "kuromoji";
import { createEmbedWithMetaData } from "protocol_util-djs";
import {
  MainCommands,
  DictionaryCommands,
} from "protocol_command-schema-main-bootstrap";
import { RandomCommand } from "../commands-v2/random";
import { LayeredVoiceConfigRepository } from "domain_voice-configs-write";
import { Usecase as VoiceConfigUsecase } from "domain_voice-configs";

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
  afterGui: PaginationGui<CtxBase<SimplePageValue>>;
  beforeGui: PaginationGui<CtxBase<SimplePageValue>>;
  mainGui: PaginationGui<CtxBase<MainPageValue>>;
  kuromoji: Tokenizer<IpadicFeatures>;
  getLang: getLangType;
  voiceConfigUsecase: VoiceConfigUsecase;
  memberVoiceConfig: LayeredVoiceConfigRepository<[string, string]>;
  color: ColorResolvable;
};
function codeblock(l: string, v: string) {
  return `\`\`\`${l}\n${v}\n\`\`\``;
}
export function initDictionaryCommands(
  opt: MainCommandOptions
): Record<DictionaryCommands, CommandBase> {
  const color = opt.color;
  const abCommonLang = (): SimpleDictionaryCommandResponses => ({
    addSuccess: (exec, cur) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("成功")
        .setDescription("変換を追加しました。")
        .addField(
          "詳細",
          ["from", codeblock("", cur.from), "to", codeblock("", cur.to)].join(
            "\n"
          )
        ),
    deleteSuccess: (exec, cur) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("成功")
        .setDescription("変換を削除しました。")
        .addField(
          "詳細",
          ["from", codeblock("", cur.from), "to", codeblock("", cur.to)].join(
            "\n"
          )
        ),
    invalidAddFormat: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription(
          [
            "入力を適切に解釈できませんでした。",
            "「数字 変換前の単語,変換後の単語」あるいは、「変換後の単語」のように使用してください。",
          ].join("\n")
        ),
    invalidIndexRange: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription("その番号のエントリーは存在しません。"),
    invalidRemoveFormat: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription(
          "第二引数は不要です。また第一引数には必ず削除したいエントリーの番号を指定する必要があります。"
        ),
    invalidUpdateFormat: (exec) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("入力エラー")
        .setDescription(
          "第一引数には必ず更新したいエントリーの番号を指定する必要があります。"
        ),
    updateSuccess: (exec, b, c) =>
      createEmbedWithMetaData({ ...exec, color })
        .setTitle("成功")
        .setDescription("変換を更新しました。")
        .addField(
          "現在の値",
          ["from", codeblock("", c.from), "to", codeblock("", c.to)].join("\n")
        )
        .addField(
          "過去の値",
          ["from", codeblock("", b.from), "to", codeblock("", b.to)].join("\n")
        ),
  });
  return {
    "after-dictionary": new SimpleDictionaryCommand(
      opt.after,
      opt.afterGui,
      abCommonLang,
      opt.getLang
    ),
    "before-dictionary": new SimpleDictionaryCommand(
      opt.before,
      opt.beforeGui,
      abCommonLang,
      opt.getLang
    ),
    "main-dictionary": new MainDictionaryCommand(
      opt.dictionary,
      opt.mainGui,
      () => ({
        addWordSuccessWithCreate: (exec, c) =>
          createEmbedWithMetaData({
            color,
            ...exec,
          })
            .setTitle("成功")
            .setDescription("変換を作成しました。")
            .addField(
              "詳細",
              ["from", codeblock("", c.from), "to", codeblock("", c.to)].join(
                "\n"
              )
            ),
        addWordSuccessWithOverwrite: (exec, b, c) =>
          createEmbedWithMetaData({ ...exec, color })
            .setTitle("成功")
            .setDescription("変換を更新しました。")
            .addField(
              "現在の値",
              ["from", codeblock("", c.from), "to", codeblock("", c.to)].join(
                "\n"
              )
            )
            .addField(
              "過去の値",
              ["from", codeblock("", b.from), "to", codeblock("", b.to)].join(
                "\n"
              )
            ),
        deleteWordSuccesWithDelete: (exec, from, to) =>
          createEmbedWithMetaData({ ...exec, color })
            .setTitle("成功")
            .setDescription("変換を削除しました。")
            .addField(
              "詳細",
              ["from", codeblock("", from), "to", codeblock("", to)].join("\n")
            ),
        deleteWordSuccesWithNone: (exec, from) =>
          createEmbedWithMetaData({ ...exec, color })
            .setTitle("成功")
            .setDescription("変換は存在しませんでした。")
            .addField("詳細", ["from", codeblock("", from)].join("\n")),
        invalidRemoveFormat: (exec) =>
          createEmbedWithMetaData({ ...exec, color })
            .setTitle("入力エラー")
            .setDescription(
              "第二引数は不要です。「mdic remove 削除したい単語」のように使用してください。"
            ),
        requireKey: (exec) =>
          createEmbedWithMetaData({ ...exec, color })
            .setTitle("入力エラー")
            .setDescription("第一引数は必須です。"),
      }),
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
                ...(ctx.newRandomizerValue
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
