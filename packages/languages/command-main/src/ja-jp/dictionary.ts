import { DescriptionData } from "protocol_command-schema-core";

export const commandDictionary: Record<
  "export" | "import" | "command" | "clear",
  DescriptionData
> = {
  command: {
    summary: "辞書全体を扱うコマンドです。",
  },
  clear: {
    summary: "辞書のエントリをすべて削除します。",
  },
  export: {
    summary: "辞書をエクスポートします。",
  },
  import: {
    summary: "辞書をインポートします。",
  },
};
const dictionaryCommon = {
  add: {
    summary: "辞書にエントリを追加します。",
  },
  list: {
    summary: "辞書のエントリを表示します。",
  },
  remove: {
    summary: "辞書からエントリを削除します。",
  },
  update: {
    summary: "辞書のエントリを上書きします。",
  },
  entry: {
    summary:
      "辞書のエントリです。スペース区切りあるいはカンマ区切りで指定します。",
  },
};
export const commandMainDictionary: Record<
  "add" | "key" | "entry" | "remove" | "update" | "list" | "command",
  DescriptionData
> = {
  command: {
    summary: "構文解析と一緒に利用されるメインの辞書に関するコマンドです。",
  },
  key: {
    summary: "辞書のエントリのキーです。",
  },
  ...dictionaryCommon,
};
const simpleDictionaryCommon = {
  ...dictionaryCommon,
  index: {
    summary: "辞書のエントリの位置を指定します。",
  },
  insert: {
    summary:
      "辞書にエントリを追加します。このコマンドはaddとは違い、挿入位置を指定する必要があります。",
  },
};
export const commandBeforeDictionary: Record<
  | "add"
  | "index"
  | "insert"
  | "entry"
  | "remove"
  | "update"
  | "list"
  | "command",
  DescriptionData
> = {
  ...dictionaryCommon,
  command: {
    summary:
      "単純置換を行う辞書です。この辞書はメインの辞書の前に使用されます。",
  },
  ...simpleDictionaryCommon,
};
export const commandAfterDictionary: Record<
  | "add"
  | "insert"
  | "index"
  | "entry"
  | "remove"
  | "update"
  | "list"
  | "command",
  DescriptionData
> = {
  ...dictionaryCommon,
  command: {
    summary:
      "単純置換を行う辞書です。この辞書はメインの辞書の後に使用されます。",
  },
  ...simpleDictionaryCommon,
};
