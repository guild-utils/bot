import * as moment from "moment";
export type GameEventKind="periodical"|"fixed";
export type DayOfWeek="Sunday"|"Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday";
export const dayOfWeekArray:[string,string,string,string,string,string,string]=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
export type HKTCollectionName={
    [P in GameEventKind]:CollectionNameBase<P>
}
export type HKTCollectionNameU<T extends HKTCollectionName>=T["fixed"]|T["periodical"];
export class GameEventTimingPeriodical{
    constructor(
        public readonly intervalInMilliseconds:moment.Duration,
        public readonly lastFireTime:moment.Moment
    ){}
}
export class GameEventTimingFixedEntry{
    constructor(
        public readonly dayOfWeek:DayOfWeek,
        public readonly hours:number,
        public readonly minutes:number
    ){}

}
export class GameEventTimingFixed{
    constructor(public readonly entrys:GameEventTimingFixedEntry[]){}
}
export abstract class GameEventCollectionBase<CollectionNameT extends CollectionNameBase<ValueT["kind"]>,ValueT extends GameEventPeriodical|GameEventFixed>{
    readonly name:CollectionNameT;
    readonly header:readonly string[];
    readonly events:ValueT[];
    readonly kind:ValueT["kind"];
    constructor(name:CollectionNameT,kind:ValueT["kind"],header:readonly string[],events:ValueT[]){
        this.name=name;
        this.header=header;
        this.kind=kind;
        this.events=events;
    }
}
export class GameEventCollectionPeriodical<CollectionNameT extends CollectionNameBase<"periodical">> extends GameEventCollectionBase<CollectionNameT,GameEventPeriodical>{
    constructor(name:CollectionNameT,header:readonly string[],events:GameEventPeriodical[]){
        super(name,"periodical",header,events);
    }
}
export class GameEventCollectionFixed<CollectionNameT extends CollectionNameBase<"fixed">> extends GameEventCollectionBase<CollectionNameT,GameEventFixed>{
    constructor(name:CollectionNameT,header:readonly string[],events:GameEventFixed[]){
        super(name,"fixed",header,events);
    }
}
export type GameEventCollection<CollectionNameT extends HKTCollectionName>=GameEventCollectionPeriodical<CollectionNameT["periodical"]>|GameEventCollectionFixed<CollectionNameT["fixed"]>
export type GameEventDesc={ readonly name:string, readonly timing:string,readonly [s: string]: string }

export abstract class GameEventBase<kindT extends GameEventKind>{
    constructor(public readonly alwaysNotify:boolean,public readonly header:readonly string[],public readonly lastNotice:moment.Moment){
        this.alwaysNotify=alwaysNotify;
        this.header=header;
    }
    get name():string{ return this.desc.name}
    readonly abstract kind:kindT;
    readonly abstract desc: GameEventDesc;
}
export class GameEventPeriodical extends GameEventBase<"periodical">{
    constructor(alwaysNotify:boolean,header:readonly string[],lastNotice:moment.Moment,timing:GameEventTimingPeriodical,public readonly desc:GameEventDesc){
        super(alwaysNotify,header,lastNotice)
        this.timing=timing
    }
    readonly timing:GameEventTimingPeriodical
    readonly kind:"periodical"="periodical"
}
export class GameEventFixed extends GameEventBase<"fixed">{
    constructor(alwaysNotify:boolean,header:readonly string[],lastNotice:moment.Moment,timing:GameEventTimingFixed,public readonly desc:GameEventDesc){
        super(alwaysNotify,header,lastNotice);
        this.timing=timing;
    }
    readonly timing:GameEventTimingFixed;
    readonly kind:"fixed"="fixed";
}
export type GameEvent=GameEventPeriodical|GameEventFixed
export type GameEventCollectionSwitch<CollectionNameT extends HKTCollectionName>={
    
    periodical:GameEventCollectionPeriodical<CollectionNameT["periodical"]>;
    fixed:GameEventCollectionFixed<CollectionNameT["fixed"]>;
}
/*export interface NotifyOnceEvent<kindT extends GameEventKind>{
    event:GameEvent<kindT>
}*/
export interface CollectionNameBase<KindT extends GameEventKind>{
    readonly name:string;
    readonly kind:KindT;
}
export interface GameEventRepository<CollectionGroupIdT,HKTCollectionNameT extends HKTCollectionName>{
    collcetionGroupId(idString:string):Promise<CollectionGroupIdT>;
    listCollectionName(collectionGroupId:CollectionGroupIdT):Promise<HKTCollectionNameU<HKTCollectionNameT>[]>;
    collectionName(collectionGroupId:CollectionGroupIdT,name:string):Promise<HKTCollectionNameU<HKTCollectionNameT>>;
    collection(collectionGroupId:CollectionGroupIdT,collectionId:HKTCollectionNameT["fixed"]):Promise<GameEventCollectionSwitch<HKTCollectionNameT>["fixed"]>;
    collection(collectionGroupId:CollectionGroupIdT,collectionId:HKTCollectionNameT["periodical"]):Promise<GameEventCollectionSwitch<HKTCollectionNameT>["periodical"]>;
    collection(collectionGroupId:CollectionGroupIdT,collectionId:HKTCollectionNameU<HKTCollectionNameT>):Promise<GameEventCollection<HKTCollectionName>>;
    put(collectionGroupId:CollectionGroupIdT,collectionId:HKTCollectionNameU<HKTCollectionNameT>,value:(string|number|null)[]):Promise<void>;
    update(collectionGroupId:CollectionGroupIdT,collectionId:HKTCollectionNameU<HKTCollectionNameT>,value:(string|number|null)[]):Promise<void>;
}
export interface GameEventNotifyRepository{
    register(guildId:string,event:GameEvent[]):Promise<void>;
}
function nextTimingDay(t:moment.Moment,now:moment.Moment,day:number){
    if(now.day()<day){
        return day;
    }
    if(now.day()>day){
        return 7+day;
    }
    if(now.isAfter(t)){
        return 7+day;
    }
    return day;
}
function nextTimingFixed(t:GameEventTimingFixedEntry,now:moment.Moment){
    const tm=now.clone();
    tm.hour(t.hours);
    tm.minute(t.minutes);
    tm.second(0);
    tm.millisecond(0);
    tm.day(nextTimingDay(tm,now,dayOfWeekArray.findIndex(e=>e===t.dayOfWeek)));
    return tm;
}
export function nextTiming(event:GameEvent,givedNow?:moment.Moment|undefined){
    const now=givedNow?givedNow:moment()
    switch(event.kind){
        case "fixed":
            return event.timing.entrys.map(e=>nextTimingFixed(e,now)).sort((a,b)=>a.diff(b))[0];
        case "periodical":
            return event.timing.lastFireTime.clone().add(event.timing.intervalInMilliseconds,"milliseconds");
    }
}