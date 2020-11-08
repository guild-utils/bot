import { createLogger } from "bunyan";
export const CommandLogger = createLogger({
  name: "command",
});
export const BotLogger = createLogger({
  name: "bot",
});
export const EngineLogger = createLogger({
  name: "bot",
});
