import { BotLogger } from "../loggers";

export function initProcessErrorHandler(): void {
  process.on("uncaughtExceptionMonitor", (err) => {
    BotLogger.fatal(err, "uncaughtExceptionMonitor");
  });
}
