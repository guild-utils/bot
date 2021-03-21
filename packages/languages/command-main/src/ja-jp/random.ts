import { DescriptionData } from "protocol_command-schema-core";

export const commandRandom: Record<
  "command" | "overwrite" | "member",
  DescriptionData
> = {
  command: {
    summary: "メンバーの音声をランダムに設定します。",
    description: [
      "メンバーの音声をランダムに設定します。",
      "正確には、memberVoiceConfigのrandomizerをv3.<randomSeed>.<flag>に設定します。",
      "randomSeedはランダムな設定のシード値、flagはoverwriteの設定に依存します。",
      "overwriteがmemberの場合すべての値がランダム化されます。",
      "overwriteがuserの場合設定を行ったサーバーに置いてはユーザーコンフィグは使用されずランダム化されます。",
      "(member configの影響は受けます)",
      "overwriteがnoneの場合、未設定の値のみがランダム化されます。",
      "overwriteのデフォルトはmemberです。",
    ].join("\n"),
  },
  overwrite: {
    summary:
      "メンバーのランダムな音声設定がどのレイヤーで適用されるのか指定します。",
  },
  member: {
    summary:
      "ランダムな音声設定をするメンバーを指定することができます。\n省略すると実行者の設定が変更されます。",
  },
};
