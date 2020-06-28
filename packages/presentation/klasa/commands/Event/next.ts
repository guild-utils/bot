import { Command, CommandStore, KlasaMessage } from "klasa";
import { autoInjectable, inject } from "tsyringe";
import * as moment from "moment-timezone";
import { GameEventUseCase } from "usecase/game-event";
import { GameEvent } from "pdomain/game-event";
import {
  googleSpreadSheetId,
  momentLocale,
  momentTZ,
} from "../../guild_settings_keys";
import * as LANG_KEYS from "../../lang_keys";
@autoInjectable()
export default class Next extends Command {
  private readonly gameEvent: GameEventUseCase;
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("GameEventUseCase") gameEvent: GameEventUseCase
  ) {
    super(store, file, directory, {
      usage: "[collectionName:string]",
      runIn: ["text"],
      requiredPermissions: ["SEND_MESSAGES"],
      description: (lang) => lang.get(LANG_KEYS.COMMAND_NEXT_DESCRIPTION),
    });
    this.gameEvent = gameEvent;
  }
  public async run(
    msg: KlasaMessage,
    [collectionName]: [string | undefined]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const gsid: string = msg.guildSettings.get(googleSpreadSheetId);
    const now = moment.utc();

    const list = collectionName
      ? await this.process(gsid, collectionName, now)
      : await this.gameEvent.nextEvents(gsid, now);
    return msg.sendMessage(
      list.map(([c, e, m]) => {
        const tzt = m
          .clone()
          .tz(msg.guildSettings.get(momentTZ))
          .locale(msg.guildSettings.get(momentLocale));
        return e.name + ":" + tzt.format("llll");
      })
    );
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async process(gsid: string, collectionName: string, now: moment.Moment) {
    const [c, e] = await this.gameEvent.nextEventsWithName(
      gsid,
      collectionName,
      now
    );
    return e.map((e2: [GameEvent, moment.Moment]): [
      typeof c,
      GameEvent,
      moment.Moment
    ] => [c, e2[0], e2[1]]);
  }
}
