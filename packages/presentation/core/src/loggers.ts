/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Logger = require("bunyan");
import * as ENV from "./bootstrap/env";
const streams: Logger.Stream[] = [{ stream: process.stdout, level: "info" }];
if (process.env["GUJ_USE_GOOGLE_STACKDRIVER"] === "true") {
  const { LoggingBunyan } = require("@google-cloud/logging-bunyan");
  const loggingBunyan = new LoggingBunyan();
  streams.push(loggingBunyan.stream("info"));
}
const addtionalOptions: Partial<Logger.LoggerOptions> = { streams };
const node = ENV.KUBE_NODE_NAME;
const pod = ENV.KUBE_POD_NAME;
export const CommandLogger = Logger.createLogger({
  name: "command",
  ...addtionalOptions,
}).child({ node, pod });
export const BotLogger = Logger.createLogger({
  name: "bot",
  ...addtionalOptions,
}).child({ node, pod });
export const EngineLogger = Logger.createLogger({
  name: "engine",
  ...addtionalOptions,
}).child({ node, pod });
