import { MonitorRunner } from "monitor-discord.js";
import { CommandLogger } from "../loggers";
const Logger = CommandLogger.child({ type: "monitor" });
export class MonitorRunnerWithLog extends MonitorRunner {
  onError(e: unknown): void {
    Logger.error(e);
  }
}
