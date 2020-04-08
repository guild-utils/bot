import { GameEventRepository,CollectionNameBase ,GameEventDesc,GameEvent,GameEventCollectionSwitch,GameEventKind, HKTCollectionNameU,HKTCollectionName, GameEventFixed, GameEventPeriodical, GameEventCollectionFixed, GameEventCollectionPeriodical} from "pdomain/game-event";
import { GoogleSpreadsheet ,GoogleSpreadsheetWorksheet} from "google-spreadsheet";
import { FixedDSLParser } from "fixed-dsl";
import { PeriodicalDSLParser } from "periodical-dsl";
const credential=require("../credential.json")
export type GssCollectionGroupIdT=GoogleSpreadsheet
class GssCollectionName<kindT extends GameEventKind> implements CollectionNameBase<kindT>{
    readonly name:string
    readonly kind:kindT
    readonly sheet:GoogleSpreadsheetWorksheet
    constructor(name:string,kind:kindT,sheet:GoogleSpreadsheetWorksheet){
        this.name=name
        this.kind=kind
        this.sheet=sheet
    }
    static create(sheet:GoogleSpreadsheetWorksheet):HKTCollectionNameU<HKTGssCollectionName>|undefined{
        const arr=sheet.title.match(/(.*)\[(periodical|fixed)\]/)
        if(arr===null||arr.length<2){
            return undefined
        }
        const name=arr[1]
        switch(arr[2] ){
            case "periodical":
            case "fixed":
                return new GssCollectionName(name,arr[2],sheet)
            default:return undefined
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
        await sheet.useServiceAccountAuth(credential)
        return sheet;
    }
    async listCollectionName(collectionGroupId:GssCollectionGroupIdT):Promise<HKTCollectionNameU<HKTGssCollectionName>[]>{
        const doc=collectionGroupId
        await doc.loadInfo();
        const sheets:any[]=doc.sheetsByIndex
        return sheets.map(GssCollectionName.create).filter((e:HKTCollectionNameU<HKTGssCollectionName>|undefined):e is HKTCollectionNameU<HKTGssCollectionName> =>e!==undefined)
    }
    async collectionName(collectionGroupId:GssCollectionGroupIdT,name:string):Promise<GssCollectionNameT<GameEventKind>>{
        const r=(await this.listCollectionName(collectionGroupId)).find(e=>e.name===name)
        if(r===undefined){
            throw new Error(`No collection with name ${name} was found.`)
        }
        return r
    }
    private async collectionPeriodical(collectionId:GssCollectionNameT<"periodical">):Promise<GameEventCollectionPeriodical<GssCollectionNameT<"periodical">>>{
        const sheet:GoogleSpreadsheetWorksheet=collectionId.sheet;
        const rc:number=sheet.rowCount;
        const cc:number=sheet.columnCount;
        await sheet.loadCells({startRowIndex:0,endRowIndex:rc,startColumnIndex:0,endColumnIndex:cc});

        const header:string[]=[];
        const events:GameEventCollectionPeriodical<GssCollectionNameT<"periodical">>["events"]=[];
        for(let j=0;j<cc;++j){
            const v=sheet.getCell(0,j).formattedValue
            if(v!==null){
                header.push(v);
            }
        }
        for(let i=1;i<rc;++i){
            let timing:string|null=null;
            let last:string|null=null;
            let notify:boolean=true;
            const desc:Partial<GameEventDesc>={};
            for(let j=0;j<Math.min(cc,header.length);++j){
                const v=sheet.getCell(i,j).formattedValue;
                switch(header[j]){
                    case "timing":
                        timing=v;
                        break;
                    case "last":
                        last=v;
                        break;
                    case "notify":
                        notify=Boolean(v);
                        break;
                    default:
                }
                desc[header[j]]=v
            }
            if(timing===null||last===null||desc.name===undefined||desc.timing===undefined){
                continue;
            }

            events.push(new GameEventPeriodical(notify,header,await this.periodicalParser.parse(timing,last),desc as GameEventDesc))
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
            const v=sheet.getCell(0,j).formattedValue
            if(v!==null){
                header.push(v);
            }
        }
        const events:GameEventCollectionFixed<GssCollectionNameT<"fixed">>["events"]=[];
        for(let i=1;i<rc;++i){
            let timing:string|null=null;
            let notify:boolean=true;
            const desc:Partial<GameEventDesc>={};
            for(let j=0;j<Math.min(cc,header.length);++j){
                const v=sheet.getCell(i,j).formattedValue;
                switch(header[j]){
                    case "timing":
                        timing=v;
                        break;
                    case "notify":
                        notify=Boolean(v);
                        break;
                    default:
                }
                desc[header[j]]=v
            }
            if(timing===null||desc.name===undefined){
                continue;
            }
            events.push(new GameEventFixed(notify,header,await this.fixedParser.parse(timing),desc as GameEventDesc))
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
    put(collectionGroupId:GssCollectionGroupIdT,collectionId:HKTGssCollectionName["fixed"],event:GameEventFixed):Promise<void>
    put(collectionGroupId:GssCollectionGroupIdT,collectionId:HKTGssCollectionName["periodical"],event:GameEventPeriodical):Promise<void>
    async put(collectionGroupId:GssCollectionGroupIdT,collectionId:HKTCollectionNameU<HKTGssCollectionName>,event:GameEvent):Promise<void>{
        const sheet=collectionId.sheet;
        const rc:number=sheet.rowCount;
        const cc:number=sheet.columnCount;
        const header:string[]=[];
        for(let j=0;j<cc;++j){
            header.push(sheet.getCell(0,j).formattedValue);
        }
        const nameIndex=header.findIndex(e=>e==="name");
        let emptyIndex= -1;
        for(let i=1;i<rc;++i){
            if(!sheet.getCell(i,nameIndex).formattedValue){
                emptyIndex=i;
                break;
            }
        }
        if(emptyIndex=== -1){
            await sheet.resize({ rowCount: rc+1,columnCount:cc} as any)
            emptyIndex=rc
        }
        sheet.loadCells({startRowIndex:emptyIndex,endRowIndex:emptyIndex+1,startColumnIndex:0,endColumnIndex:cc})
        for(let j=0;j<Math.min(cc,header.length);++j){
            const cell=sheet.getCell(emptyIndex,j)
            switch(header[j] ){
                case "name":
                    cell.value=event.name;
                    break;
                case "notify":
                    cell.value=event.alwaysNotify;
                    break;
                default:
                    cell.value=event.desc[header[j]]
            }
        }
        await sheet.saveUpdatedCells();
    }

}