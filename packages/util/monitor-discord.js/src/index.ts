import { Client, ClientUser, Message } from "discord.js";

export type MonitorOptions = {
  ignoreBots: boolean;
  ignoreSelf: boolean;
  ignoreOthers: boolean;
  ignoreWebhooks: boolean;
  ignoreEdits: boolean;
};
export interface Monitor {
  options: Readonly<MonitorOptions>;
  run(message: Message): Promise<unknown>;
  init(client: Client): void;
}
export abstract class MonitorBase implements Monitor {
  constructor(public readonly options: Readonly<MonitorOptions>) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  init(client: Client): void {
    // do nothing
  }
  abstract run(message: Message): Promise<unknown>;
}

export abstract class MonitorRunner {
  constructor(private readonly monitors: Set<Monitor>) {}
  edit(newMsg: Message): void {
    const self = newMsg.client.user;
    if (!self) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.monitors.forEach((m) => this.mayRunMonitor(newMsg, m, self));
  }
  create(newMsg: Message): void {
    const self = newMsg.client.user;
    if (!self) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.monitors.forEach((m) => this.mayRunMonitor(newMsg, m, self));
  }
  init(client: Client): void {
    this.monitors.forEach((m) => {
      try {
        m.init(client);
      } catch (e) {
        this.onError(e);
      }
    });
  }
  private async mayRunMonitor(
    msg: Message,
    monitor: Monitor,
    self: ClientUser
  ): Promise<void> {
    const o = monitor.options;
    if (o.ignoreBots && msg.author.bot) return;
    if (o.ignoreSelf && msg.author === self) return;
    if (o.ignoreOthers && msg.author !== self) return;
    if (o.ignoreWebhooks && msg.webhookID != null) return;
    if (o.ignoreEdits && (msg.editedTimestamp || msg.editedAt)) return;
    try {
      await monitor.run(msg);
    } catch (e) {
      this.onError(e);
    }
  }
  abstract onError(err: unknown): void;
}
