import * as Core from "protocol_command-schema-core-bootstrap";
import * as Main from "protocol_command-schema-main-bootstrap";
const dummyClient = () => {
  throw new TypeError();
};
const conf = Core.defineConfCommandSchema(
  {
    guild: true,
    member: true,
    user: true,
  },
  dummyClient
);
export const Configurate = {
  summary: "設定に関するコマンド",
  value: {
    ...Core.defineConfigurateCommandSchema(dummyClient),
    ...conf,
  },
};
export const Voice = {
  summary: "読み上げに関するコマンド",
  value: Core.definedVoiceCommandSchema(dummyClient),
};
export const BotInfo = {
  summary: "botの情報に関するコマンド",
  value: Core.definedBotInfoCommandSchema(),
};
export const Words = {
  summary: "辞書に関するコマンド",
  value: Main.defineMainCommandSchema(dummyClient),
};
export const categorys = {
  Configurate,
  Voice,
  BotInfo,
  Words,
};
export const mainOnlyCommands = new Set(
  [
    ...Object.values(Words.value),
    conf.userconf,
    conf.memconf,
    conf["memconf.member"],
  ].map((e) => e.name)
);
