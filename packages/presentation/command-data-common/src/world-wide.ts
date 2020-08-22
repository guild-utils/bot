export type WWCommandData = {
  receiver: ("main" | "sub")[];
  name: string;
  runIn: ("text" | "dm" | "news")[];
  category: string;
  subCategory: string;
  aliases?: string[];
  usage?: string;
  guarded?: boolean;
  cooldownLevel?: "guild";
  cooldown?: number;
  usageDelim?: string;
  permissionLevel?: number;
};
export type LSCommandData = {
  description?: string;
  more?: string;
};
export type VoiceKind =
  | "normal"
  | "angry"
  | "happy"
  | "neutral"
  | "sad"
  | "mei_angry"
  | "mei_bashful"
  | "mei_happy"
  | "mei_normal"
  | "mei_sad"
  | "takumi_angry"
  | "takumi_happy"
  | "takumi_normal"
  | "takumi_sad"
  | "alpha"
  | "beta"
  | "gamma"
  | "delta";
export const VoiceKindArray: VoiceKind[] = [
  "normal",
  "angry",
  "happy",
  "neutral",
  "sad",
  "mei_angry",
  "mei_bashful",
  "mei_happy",
  "mei_normal",
  "mei_sad",
  "takumi_angry",
  "takumi_happy",
  "takumi_normal",
  "takumi_sad",
  "alpha",
  "beta",
  "gamma",
  "delta",
];
const CoreCommandReceiver: ["main", "sub"] = ["main", "sub"];
const CoreCommandBase: {
  guarded: true;
  runIn: ["text", "dm", "news"];
  receiver: ["main", "sub"];
  category: "General";
  subCategory: "Chat Bot Info";
} = {
  runIn: ["text", "dm", "news"],
  guarded: true,
  receiver: CoreCommandReceiver,
  category: "General",
  subCategory: "Chat Bot Info",
};

export const help: WWCommandData = {
  name: "help",
  aliases: ["h", "commands", "command", "categorys", "category"],
  usage: "(Command:command|Category:category)",
  ...CoreCommandBase,
};
export const info: WWCommandData = {
  name: "info",
  aliases: ["details", "what"],
  ...CoreCommandBase,
};
export const invite: WWCommandData = {
  name: "invite",
  ...CoreCommandBase,
};
export const ping: WWCommandData = {
  name: "ping",
  ...CoreCommandBase,
};
export const stats: WWCommandData = {
  name: "stats",
  ...CoreCommandBase,
};
const RunInServer: ["text", "news"] = ["text", "news"];
export const conf: WWCommandData = {
  name: "conf",
  permissionLevel: 6,
  usage: "<set|show|remove|reset> (key:key) (value:value) [...]",
  usageDelim: " ",
  guarded: true,
  runIn: RunInServer,
  receiver: ["main", "sub"],
  category: "Settings",
  subCategory: "Server Settings",
};
export const Core = [help, info, invite, ping, stats, conf];
export const memconf: WWCommandData = {
  name: "memconf",
  receiver: ["main"],
  guarded: true,
  runIn: RunInServer,
  usage: "<set|show|remove|reset> (key:key) (value:value) [...]",
  aliases: ["gmconf"],
  usageDelim: " ",
  category: "Settings",
  subCategory: "Server Member Settings",
};
export const memconf_member: WWCommandData = {
  name: "memconf.member",
  receiver: ["main"],
  guarded: true,
  runIn: RunInServer,
  permissionLevel: 6,
  usage: "<set|show|remove|reset> <user:user> (key:key) (value:value) [...]",
  aliases: ["memconf.m", "gmconf.m"],
  usageDelim: " ",
  category: "Settings",
  subCategory: "Server Member Settings",
};
export const MemberSettings = [memconf, memconf_member];
export const userconf: WWCommandData = {
  receiver: ["main"],
  name: "userconf",
  runIn: ["text", "dm", "news"],
  guarded: true,
  usage: "<set|show|remove|reset> (key:key) (value:value) [...]",
  usageDelim: " ",
  category: "Settings",
  subCategory: "User Settings",
};
const VoiceBasicCategory = {
  category: "Voice",
  subCategory: "Basic",
};
const VoiceDictionaryCategory = {
  category: "Voice",
  subCategory: "Dictionary",
};
const VoiceDictionaryOldCategory = {
  category: "Voice",
  subCategory: "DictionaryOld",
};
export const end: WWCommandData = {
  receiver: CoreCommandReceiver,
  name: "end",
  runIn: RunInServer,
  aliases: ["e"],
  ...VoiceBasicCategory,
};

export const end_channel: WWCommandData = {
  receiver: CoreCommandReceiver,
  name: "end_channel",
  runIn: RunInServer,
  aliases: ["ec"],
  ...VoiceBasicCategory,
};
export const skip: WWCommandData = {
  receiver: CoreCommandReceiver,
  name: "skip",
  runIn: RunInServer,
  ...VoiceBasicCategory,
};
export const start: WWCommandData = {
  receiver: CoreCommandReceiver,
  name: "start",
  runIn: RunInServer,
  aliases: ["s"],
  ...VoiceBasicCategory,
};
export const VoiceBasic = [end, end_channel, skip, start];
export const add_word: WWCommandData = {
  receiver: ["main"],
  name: "add_word",
  runIn: RunInServer,
  usage: "",
  aliases: ["aw"],
  ...VoiceDictionaryOldCategory,
};

export const add_word_after: WWCommandData = {
  receiver: ["main"],
  name: "add_word_after",
  runIn: RunInServer,
  usage: "",
  aliases: ["awa"],
  ...VoiceDictionaryOldCategory,
};

export const add_word_before: WWCommandData = {
  receiver: ["main"],
  name: "add_word_before",
  runIn: RunInServer,
  usage: "",
  aliases: ["awb"],
  ...VoiceDictionaryOldCategory,
};

export const clear: WWCommandData = {
  receiver: ["main"],
  permissionLevel: 6,
  name: "clear",
  runIn: RunInServer,
  ...VoiceDictionaryOldCategory,
};

export const delete_word: WWCommandData = {
  receiver: ["main"],
  name: "delete_word",
  runIn: RunInServer,
  usage: "",
  aliases: ["dw"],
  ...VoiceDictionaryOldCategory,
};

export const delete_word_after: WWCommandData = {
  receiver: ["main"],
  name: "delete_word_after",
  runIn: RunInServer,
  usage: "",
  aliases: ["dwa"],
  ...VoiceDictionaryOldCategory,
};

export const delete_word_before: WWCommandData = {
  receiver: ["main"],
  name: "delete_word_before",
  runIn: RunInServer,
  usage: "",
  aliases: ["dwb"],
  ...VoiceDictionaryOldCategory,
};

export const exportC: WWCommandData = {
  receiver: ["main"],
  permissionLevel: 6,
  name: "export",
  runIn: RunInServer,
  ...VoiceDictionaryOldCategory,
};

export const importC: WWCommandData = {
  receiver: ["main"],
  permissionLevel: 6,
  cooldownLevel: "guild",
  cooldown: 30,
  name: "import",
  runIn: RunInServer,
  ...VoiceDictionaryOldCategory,
};

export const jumanpp: WWCommandData = {
  receiver: ["main"],
  name: "jumanpp",
  usage: "<text:string>",
  runIn: RunInServer,
  ...VoiceDictionaryCategory,
};

export const kuromoji: WWCommandData = {
  receiver: ["main"],
  name: "kuromoji",
  usage: "<text:string>",
  runIn: RunInServer,
  ...VoiceDictionaryCategory,
};
export const VoiceDictionaryOld = [
  add_word,
  add_word_after,
  add_word_before,
  clear,
  delete_word,
  delete_word_after,
  delete_word_before,
  exportC,
  importC,
];
export const dictionary: WWCommandData = {
  receiver: ["main"],
  name: "dictionary",
  usage: "<export|import|clear>",
  permissionLevel: 6,
  aliases: ["dic", "dict"],
  runIn: RunInServer,
  ...VoiceDictionaryCategory,
};

const ABUsage =
  "<add|remove|update|list> [index:number|entey:simple-dict-entry] [entry:simple-dict-entry|to:string]";
export const after_dictionary: WWCommandData = {
  receiver: ["main"],
  name: "after-dictionary",
  aliases: ["adic"],
  usage: ABUsage,
  usageDelim: " ",
  runIn: RunInServer,
  ...VoiceDictionaryCategory,
};
export const before_dictionary: WWCommandData = {
  receiver: ["main"],
  name: "before-dictionary",
  aliases: ["bdic"],
  usage: ABUsage,
  usageDelim: " ",
  runIn: RunInServer,
  ...VoiceDictionaryCategory,
};
export const main_dictionary: WWCommandData = {
  receiver: ["main"],
  name: "main-dictionary",
  aliases: ["mdic"],
  usage: "<add|remove|update|list> [key:string] [entry:main-dict-entry]",
  usageDelim: " ",
  runIn: RunInServer,
  ...VoiceDictionaryCategory,
};
export const VoiceDictionary = [
  jumanpp,
  kuromoji,
  dictionary,
  after_dictionary,
  main_dictionary,
  before_dictionary,
];
export const All = [
  ...Core,
  ...MemberSettings,
  userconf,
  ...VoiceBasic,
  ...VoiceDictionary,
  ...VoiceDictionaryOld,
];
