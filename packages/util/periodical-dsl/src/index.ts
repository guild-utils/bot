import { GameEventTimingPeriodical } from "domain_game-event";
import * as moment from "moment-timezone";

export class PeriodicalDSLParser {
  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(
    src: string,
    last: moment.Moment
  ): Promise<GameEventTimingPeriodical> {
    return new GameEventTimingPeriodical(moment.duration(src), last);
  }
}
