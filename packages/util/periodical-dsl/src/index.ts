import { GameEventTimingPeriodical } from "pdomain/game-event";
import * as moment from "moment"
export class PeriodicalDSLParser{
    async parse(src:string,last:string):Promise<GameEventTimingPeriodical>{
        return new GameEventTimingPeriodical(moment.duration(src), moment(last))
    }
}
