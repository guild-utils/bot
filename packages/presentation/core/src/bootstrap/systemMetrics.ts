import { BotLogger } from "../loggers";

export function initSystemMetrics(): void {
  setInterval(() => {
    BotLogger.info(
      {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
      },
      "System Metrics"
    );
  }, 1000 * 60 * 10);
}
