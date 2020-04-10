import { GameEventRepository,CollectionNameBase ,GameEventDesc,GameEventCollectionSwitch,GameEventKind, HKTCollectionNameU,HKTCollectionName, GameEventFixed, GameEventPeriodical, GameEventCollectionFixed, GameEventCollectionPeriodical} from "pdomain/game-event";
import { GoogleSpreadsheet ,GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import { FixedDSLParser } from "fixed-dsl";
import { PeriodicalDSLParser } from "periodical-dsl";
import * as moment from "moment";
const credential=require("../credential.json");
export type GssCollectionGroupIdT=GoogleSpreadsheet;
class GssCollectionName<kindT extends GameEventKind> implements CollectionNameBase<kindT>{
    readonly name:string
    readonly kind:kindT
    readonly sheet:GoogleSpreadsheetWorksheet
    constructor(name:string,kind:kindT,sheet:GoogleSpreadsheetWorksheet){
        this.name=name;
        this.kind=kind;
        this.sheet=sheet;
    }
    static create(sheet:GoogleSpreadsheetWorksheet):HKTCollectionNameU<HKTGssCollectionName>|undefined{
        const arr=sheet.title.match(/(.*)\[(periodical|fixed)\]/)
        if(arr===null||arr.length<2){
            return undefined;
        }
        const name=arr[1]
        switch(arr[2] ){
            case "periodical":
            case "fixed":
                return new GssCollectionName(name,arr[2],sheet);
            default:
                return undefined;
        }
    }
}
export interface HKTGssCollectionName extends HKTCollectionName{
    periodical:GssCollectionName<"periodical">
    fixed:GssCollectionName<"fixed">
}
export type GssCollectionNameT<kindT extends GameEventKind>=GssCollectionName<kindT>
export class GssGameEventRepository implements GameEventRepository<GssCollectionGroupIdT,HKTGssCollectionName>{
    private fixedParser:FixedDSLParser=new FixedDSLParser()
    private periodicalParser:PeriodicalDSLParser=new PeriodicalDSLParser()
    async collcetionGroupId(idString:string):Promise<GssCollectionGroupIdT>{
        const sheet=new GoogleSpreadsheet(idString);
        await sheet.useServiceAccountAuth(credential);
        return sheet;
    }
    async listCollectionName(collectionGroupId:GssCollectionGroupIdT):Promise<HKTCollectionNameU<HKTGssCollectionName>[]>{
        const doc=collectionGroupId;
        await doc.loadInfo();
        const sheets=doc.sheetsByIndex;
        return sheets.map(GssCollectionName.create).filter((e:HKTCollectionNameU<HKTGssCollectionName>|undefined):e is HKTCollectionNameU<HKTGssCollectionName> =>e!==undefined);
    }
    async collectionName(collectionGroupId:GssCollectionGroupIdT,name:string):Promise<GssCollectionNameT<GameEventKind>>{
        const r=(await this.listCollectionName(collectionGroupId)).find(e=>e.name===name);
        if(r===undefined){
            throw new Error(`No collection with name ${name} was found.`);
        }
        return r;
    }
    SerialDateToMoment(serialDate,offsetUTC ) {
        //var days = Math.floor(serialDate);
        var hours = Math.floor((serialDate % 1) * 24);
        var minutes = Math.floor((((serialDate % 1) * 24) - hours) * 60);
        return moment.utc(Date.UTC(0, 0, serialDate, hours-(24+offsetUTC), minutes));
      }
    private async collectionPeriodical(collectionId:GssCollectionNameT<"periodical">):Promise<GameEventCollectionPeriodical<GssCollectionNameT<"periodical">>>{
        const sheet:GoogleSpreadsheetWorksheet=collectionId.sheet;
        const rc:number=sheet.rowCount;
        const cc:number=sheet.columnCount;
        await sheet.loadCells({startRowIndex:0,endRowIndex:rc,startColumnIndex:0,endColumnIndex:cc});

        const header:string[]=[];
        const events:GameEventCollectionPeriodical<GssCollectionNameT<"periodical">>["events"]=[];
        for(let j=0;j<cc;++j){
            const v=sheet.getCell(0,j).formattedValue;
            if(v!==null){
                header.push(v);
            }
        }
        for(let i=1;i<rc;++i){
            let timing:string|null=null;
            let last:moment.Moment|null=null;
            let notify:boolean=true;
            let lastNotice:moment.Moment|null=null;
            const desc:Partial<GameEventDesc&{last:string}>={};
            for(let j=0;j<Math.min(cc,header.length);++j){
                const v=sheet.getCell(i,j);
                switch(header[j]){
                    case "timing":
                        timing=v.formattedValue;
                        break;
                    case "last":
                        if(typeof v.value==="number"){
                            last=this.SerialDateToMoment(v.value,9);
                        }
                        break;
                    case "lastNotice":
                        if(v.value===null){
                            lastNotice=this.SerialDateToMoment(0,9);
                        }else if(typeof v.value==="number"){
                            lastNotice=this.SerialDateToMoment(v.value,9);
                        }
                        break;
                    case "notify":
                        notify=Boolean(v.formattedValue);
                        break;
                    default:
                }
                desc[header[j]]=v.formattedValue;
            }
            if(timing===null||last===null||lastNotice===null||desc.name===undefined||desc.timing===undefined){
                continue;
            }

            events.push(new GameEventPeriodical(notify,header,lastNotice,await this.periodicalParser.parse(timing,last),desc as GameEventDesc&{last:string}));
        }
        return new GameEventCollectionPeriodical(collectionId,header,events);
    }
    private async collectionFixed(collectionId:GssCollectionNameT<"fixed">):Promise<GameEventCollectionFixed<GssCollectionNameT<"fixed">>>{
        const sheet:GoogleSpreadsheetWorksheet=collectionId.sheet;
        const rc:number=sheet.rowCount;
        const cc:number=sheet.columnCount;
        await sheet.loadCells({startRowIndex:0,endRowIndex:rc,startColumnIndex:0,endColumnIndex:cc});

        const header:string[]=[];
        for(let j=0;j<cc;++j){
            const v=sheet.getCell(0,j).formattedValue;
            if(v!==null){
                header.push(v);
            }
        }
        const events:GameEventCollectionFixed<GssCollectionNameT<"fixed">>["events"]=[];
        for(let i=1;i<rc;++i){
            let timing:string|null=null;
            let notify:boolean=true;
            const desc:Partial<GameEventDesc>={};
            let lastNotice:moment.Moment|null=null;
            for(let j=0;j<Math.min(cc,header.length);++j){
                const v=sheet.getCell(i,j);
                switch(header[j]){
                    case "timing":
                        timing=v.formattedValue;
                        break;
                    case "notify":
                        notify=Boolean(v.formattedValue);
                        break;
                    case "lastNotice":
                        if(v.value===null){
                            lastNotice=this.SerialDateToMoment(0,9);
                        }else if(typeof v.value==="number"){
                            lastNotice=this.SerialDateToMoment(v.value,9);
                        }
                        break;
                    default:
                }
                desc[header[j]]=v.formattedValue;
            }
            if(timing===null||lastNotice===null||desc.name===undefined){
                continue;
            }
            events.push(new GameEventFixed(notify,header,lastNotice,await this.fixedParser.parse(timing),desc as GameEventDesc))
        }
        return new GameEventCollectionFixed(collectionId,header,events);
    }
    async collection(collectionGroupId:GssCollectionGroupIdT,collectionId:HKTGssCollectionName["fixed"]):Promise<GameEventCollectionSwitch<HKTGssCollectionName>["fixed"]>;
    async collection(collectionGroupId:GssCollectionGroupIdT,collectionId:HKTGssCollectionName["periodical"]):Promise<GameEventCollectionSwitch<HKTGssCollectionName>["periodical"]>;
    async collection(collectionGroupId:GssCollectionGroupIdT,collectionId:HKTGssCollectionName["fixed"]|HKTGssCollectionName["periodical"]):Promise<GameEventCollectionSwitch<HKTGssCollectionName>["fixed"]|GameEventCollectionSwitch<HKTGssCollectionName>["periodical"]>    {
        switch(collectionId.kind){
            case "periodical":
                return this.collectionPeriodical(collectionId); 
            case "fixed":
                return this.collectionFixed(collectionId);
        }
    }
    

    async put(collectionGroupId:GssCollectionGroupIdT,collectionId:HKTCollectionNameU<HKTGssCollectionName>,value:(string|number|null)[]):Promise<void>{
        const sheet=collectionId.sheet;
        const rc:number=sheet.rowCount;
        const cc:number=sheet.columnCount;
        const header:string[]=[];
        await sheet.loadCells({startRowIndex:0,endRowIndex:rc,startColumnIndex:0,endColumnIndex:cc});
        for(let j=0;j<cc;++j){
            header.push(sheet.getCell(0,j).formattedValue);
        }
        const nameIndex=header.findIndex(e=>e==="name");
        if(nameIndex===-1){
            throw new TypeError("name column not found");
        }
        let emptyIndex= -1;
        for(let i=1;i<rc;++i){
            if(!sheet.getCell(i,nameIndex).formattedValue){
                emptyIndex=i;
                break;
            }
        }
        if(emptyIndex=== -1){
            await sheet.resize({ rowCount: rc+1,columnCount:cc} as any);
            emptyIndex=rc
        }
        await sheet.loadCells({startRowIndex:emptyIndex,endRowIndex:emptyIndex+1,startColumnIndex:0,endColumnIndex:cc})
        for(let j=0;j<Math.min(cc,value.length);++j){
            const cell=sheet.getCell(emptyIndex,j);
            const v=value[j];
            if(v!==null){
                cell.value=v;
            } 
        }
        await sheet.saveUpdatedCells();
    }
    async update(collectionGroupId:GssCollectionGroupIdT,collectionId:HKTCollectionNameU<HKTGssCollectionName>,value:(string|number|null)[]):Promise<void>{
        const sheet=collectionId.sheet;
        const rc:number=sheet.rowCount;
        const cc:number=sheet.columnCount;
        await sheet.loadCells({startRowIndex:0,endRowIndex:rc,startColumnIndex:0,endColumnIndex:cc});
        const header:string[]=[];
        for(let j=0;j<cc;++j){
            header.push(sheet.getCell(0,j).formattedValue);
        }
        const nameIndex=header.findIndex(e=>e==="name");
        if(nameIndex===-1){
            throw new TypeError("name column not found");
        }
        for(let i=1;i<rc;++i){
            const v=sheet.getCell(i,nameIndex).formattedValue
            if(v!==value[nameIndex]){
                continue;
            }
            for(let j=0;j<Math.min(cc,value.length);++j){
                const v=value[j]
                if(j===nameIndex||v===null){
                    continue;
                }
                sheet.getCell(i,j).value=v;
            }
        }
        await sheet.saveUpdatedCells();
    }
}