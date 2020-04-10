import { GameEventTimingPeriodical } from "pdomain/game-event";
import * as moment from "moment"
export class PeriodicalDSLParser{
    async parse(src:string,last:moment.Moment):Promise<GameEventTimingPeriodical>{
        return new GameEventTimingPeriodical(moment.duration(src),last )
    }
}
