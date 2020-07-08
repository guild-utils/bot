import { TaskStore, Settings, Task } from "klasa";
import { TextChannel } from "discord.js";
import { inject, autoInjectable } from "tsyringe";
import * as moment from "moment-timezone";
import {
  GameEvent,
  GameEventNotificationRepository,
  GameEventCollection,
  HKTCollectionName,
  nextNoticeTime,
} from "domain_core/game-event";
import { GameEventUseCase } from "usecase/game-event";
import { Metadata } from "schedule";
import {
  noticeChannel,
  googleSpreadSheetId,
  nextTaskId,
  momentTZ,
} from "../guild_settings_keys";
import * as LANG_KEYS from "../lang_keys";
export const taskName = "event-notice";
@autoInjectable()
export default class extends Task {
  constructor(
    store: TaskStore,
    file: string[],
    directory: string,
    @inject("GameEventUseCase") private gameEvent: GameEventUseCase,
    @inject("GameEventNotificationRepository")
    private notificationRepo: GameEventNotificationRepository
  ) {
    super(store, file, directory, { name: taskName, enabled: true });
  }
  async run(meta: Metadata): Promise<void> {
    const guild = this.client.guilds.resolve(meta.guildId);
    if (!guild) {
      return;
    }
    guild.settings.update(nextTaskId.join("."), null);
    const g = this.client.guilds.resolve(meta.guildId);
    if (!g) {
      this.client.emit("wtf", "guild is falty");
      return;
    }
    await this.notice(g.settings, meta);
  }
  async notice(guildSettings: Settings, meta: Metadata): Promise<void> {
    const channelId = guildSettings.get(noticeChannel);
    const channel = this.client.channels.resolve(channelId);
    if (!(channel instanceof TextChannel)) {
      return;
    }
    const gid = guildSettings.get(googleSpreadSheetId);
    const taskTime = moment(meta.time);
    const arr = await this.gameEvent.nextEvents(gid, taskTime);
    const now = moment.utc();
    const target: [
      GameEventCollection<HKTCollectionName>,
      GameEvent,
      moment.Moment
    ][] = [];
    const promise: Promise<unknown>[] = [];
    const tznow = now.clone().tz(guildSettings.get(momentTZ));
    for (let i = 0; i < arr.length; ++i) {
      const nnt = nextNoticeTime(arr[i][1], taskTime);
      if (
        !(
          nnt !== undefined &&
          nnt.isSameOrBefore(now) &&
          arr[i][1].lastNotice.isBefore(taskTime)
        )
      ) {
        continue;
      }
      target.push(arr[i]);
      promise.push(
        this.gameEvent.updateLastNoticeTime(
          gid,
          arr[i][0].name.name,
          arr[i][1],
          tznow
        )
      );
    }
    await Promise.all([
      ...promise,
      ...target.map((e) => this.send(channel, e[1], e[2], now)),
    ]);
    await this.notificationRepo.register(
      meta.guildId,
      (await this.gameEvent.allEvents(gid)).map((e) => e[1])
    );
  }
  async send(
    channel: TextChannel,
    event: GameEvent,
    t: moment.Moment,
    now: moment.Moment
  ) {
    channel.sendLocale(LANG_KEYS.NOTIFY_TO_NOTIFICATION_CHANNEL, [
      event,
      t,
      now,
    ]);
  }
}
