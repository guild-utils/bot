import { DescriptionData } from "protocol_command-schema-core";

export const commandAppliedVoiceConfig: Record<
  "command" | "member",
  DescriptionData
> = {
  command: {
    summary: "現在適用されている読み上げに関する設定を表示します。",
  },
  member: {
    summary:
      "設定を表示するメンバーをIDあるいはメンションにより指定します。\n省略した場合は実行者の設定を表示します。",
  },
};

export const commandEndChannel: Record<"command", DescriptionData> = {
  command: {
    summary: "実行したテキストチャンネルでの読み上げを終了します。",
  },
};
export const commandEnd: Record<"command", DescriptionData> = {
  command: {
    summary: "読み上げを終了します。",
  },
};
export const commandSkip: Record<"command", DescriptionData> = {
  command: {
    summary: "現在読み上げているテキストをスキップします。",
  },
};
export const commandStart: Record<"command", DescriptionData> = {
  command: {
    summary: "読み上げを開始します。",
  },
};
