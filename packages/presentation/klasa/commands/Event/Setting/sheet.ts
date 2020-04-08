import {Command,CommandStore,KlasaMessage} from 'klasa'
import { googleSpreadSheetId } from '../../../settings';

export default class extends Command{
    constructor(store: CommandStore, file: string[], directory: string) {
        super(store,file,directory,{
            usage:"<get|set> [value:string]",
            usageDelim:" ",
            //subcommands:true
        })
    }
    public async run(msg: KlasaMessage, [k,v]:[string,string|undefined]): Promise<KlasaMessage | KlasaMessage[] | null>{

        return this[k](msg,[k,v])
    }
    public async get(msg: KlasaMessage, args:[string,string|undefined]): Promise<KlasaMessage | KlasaMessage[] | null>{
        const v=await msg.guildSettings.get(googleSpreadSheetId);
        if(v===""){
            return msg.sendMessage(`current google spread sheet id isn't set!`)
        }
        return msg.sendMessage(`current google spread sheet id is ${v}!`);
    }
    public async set(msg:KlasaMessage,[k,v]:[string,string|undefined]): Promise<KlasaMessage | KlasaMessage[] | null>{
        const status=await msg.guildSettings.update(googleSpreadSheetId.join("."),v,msg);
        if(status.errors.length!==0){
            return Promise.all([msg.sendMessage("Error!"),...status.errors.map(e=>msg.sendMessage(e))]);
        }
        if(status.updated.length===0){
            return msg.sendMessage(`not changed!current google spread sheet id is ${v} `);   
        }
        return msg.sendMessage(`changed! current google spread sheet id is ${ status.updated[0].data[1]}!`);   
    }

}