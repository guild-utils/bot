import {
  Context,
  DescriptionData,
  getPrefixWithContext,
} from "protocol_command-schema-core";
export const commandHelp = (
  ctx: Context
): Record<"command" | "key", DescriptionData> => {
  const cmd: string = (ctx.runningCommand && ctx.runningCommand[0]) ?? "help";
  const prefix = getPrefixWithContext(ctx);
  return {
    command: {
      summary: [
        "ヘルプを表示するコマンドです。",
        `${prefix}${cmd}で全体のhelpを確認。`,
        `${prefix}${cmd} \`カテゴリ名\`でカテゴリについて詳細を確認。`,
        `${prefix}${cmd} \`コマンド名\`でコマンドについて詳細を確認。`,
        "一部のコマンドは追加のヘルプを持ちます。詳細は各コマンドのfooterを参照してください。",
      ].join("\n"),
    },
    key: {
      summary:
        "何についてのヘルプを表示するか指定します。\nコマンドの他にもカテゴリ等を指定できます。\n省略可能です。",
    },
  };
};

export const commandInfo: Record<"command", DescriptionData> = {
  command: {
    summary: "このbotについての情報を表示します。",
  },
};

export const commandInvite: Record<"command", DescriptionData> = {
  command: {
    summary: "このbotの招待リンクとサポートサーバーの招待リンクを表示します。",
  },
};

export const commandPing: Record<"command", DescriptionData> = {
  command: {
    summary: "botの応答時間を確認します。",
  },
};
export const commandStats: Record<"command", DescriptionData> = {
  command: {
    summary: "botの統計情報を表示します。",
  },
};
