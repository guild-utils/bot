import { DescriptionData } from "protocol_command-schema-core";
const MSU: Record<"member" | "user" | "server", DescriptionData> = {
  member: {
    summary:
      "メンバー設定を変更する場合に指定します。\n--member=<member>または--memberのように使用します。\n<member>が指定されない後者の場合は実行者の設定が変更されます。\n<member>を指定するにはサーバーの管理権限が必要です。",
  },
  server: {
    summary:
      "サーバー設定を変更する場合に指定します。\n--serverのように使用します。\nこれを指定するにはサーバーの管理権限が必要です。\n実行されたサーバの設定が変更されます。",
  },
  user: {
    summary:
      "ユーザー設定を変更する場合に使用します。\n--userのように使用します。\n実行したユーザーの設定が変更されます。",
  },
};
export const commandSet: Record<
  "key" | "value" | "command" | "member" | "user" | "server",
  DescriptionData
> = {
  command: {
    summary: "設定に値を設定するコマンドです。",
  },
  key: {
    summary: "どの設定を変更するか指定します。", //TODO
  },
  value: {
    summary: "設定する値を指定します。keyによって指定できる値が違います。",
  },
  ...MSU,
};
export const commandGet: Record<
  "key" | "command" | "member" | "user" | "server",
  DescriptionData
> = {
  command: {
    summary: "設定を確認するコマンドです。",
  },
  key: {
    summary: "どの設定の値を取得するか指定します。", //TODO
  },
  ...MSU,
};
export const commandAdd: Record<
  "key" | "value" | "command" | "member" | "user" | "server",
  DescriptionData
> = {
  command: {
    summary:
      "設定に値を追加するコマンドです。配列や集合のような設定に用います。",
  },
  key: {
    summary: "どの設定の値を操作するか指定します。", //TODO
  },
  value: {
    summary: "追加する値を指定します。keyによって指定できる値が違います。",
  },
  ...MSU,
};
export const commandRemove: Record<
  "key" | "value" | "command" | "member" | "user" | "server",
  DescriptionData
> = {
  command: {
    summary:
      "設定から値を削除するコマンドです。配列や集合のような設定に用います。",
  },
  key: {
    summary: "どの設定の値を操作するか指定します。", //TODO
  },
  value: {
    summary:
      "削除する値を指定します。keyによって指定できる値が違います。配列の場合indexとなります。",
  },
  ...MSU,
};
export const commandReset: Record<
  "key" | "command" | "member" | "user" | "server",
  DescriptionData
> = {
  command: {
    summary: "設定の値を削除しデフォルトに戻すコマンドです。",
  },
  key: {
    summary: "どの設定の値をデフォルトに戻すか指定します。", //TODO
  },
  ...MSU,
};
export function commandConf(
  command: string
): Record<
  | "command"
  | "key"
  | "add"
  | "get"
  | "remove"
  | "reset"
  | "set"
  | "value"
  | "member",
  DescriptionData
> {
  return {
    add: {
      summary: "追加を行うサブコマンドです。",
    },
    get: {
      summary: "表示を行うサブコマンドです。",
    },
    key: {
      summary: "対象を指定します。",
    },
    remove: {
      summary: "削除を行うサブコマンドです。",
    },
    reset: {
      summary: "デフォルトへ戻す際に用いるサブコマンドです。",
    },
    set: {
      summary: "値をセットする際に用いるサブコマンドです。",
    },
    value: {
      summary: "値を指定します。",
    },
    command: {
      summary: command,
    },
    member: {
      summary: "メンバーをメンションまたはIDで指定します。",
    },
  };
}
const configurateCommands = {
  commandSet,
  commandGet,
  commandAdd,
  commandRemove,
  commandReset,
};
export default configurateCommands;
