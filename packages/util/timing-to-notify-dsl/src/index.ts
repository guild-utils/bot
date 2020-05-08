import * as moment from "moment-timezone";

export class TimingToNotifyDSLParser{
    async parse(src:string):Promise<moment.Duration[]>{
        return src.replace(" ","").split(",").map(e=>moment.duration(e));
    }
}
