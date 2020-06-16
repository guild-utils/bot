import {Command,CommandStore,KlasaMessage} from 'klasa';
import * as GUILD_SETINGS from "../../guild_settings_keys";
import * as LANG_KEYS from "../../lang_keys";
export default class extends Command{
    constructor(
        store: CommandStore,
        file: string[],
        directory: string,
    ) {
        super(store,file,directory,{
            usage:"<word:string> [to:string] [pos:string] [pos_detail_1:string] [pos_detail_2:string] [pos_detail_3:string]",
            runIn:["text"],
            aliases:["aw"],
            description:lang=>lang.get(LANG_KEYS.COMMAND_ADD_WORD_DESCRIPTION),
            usageDelim:" "
        });
    }
    public async run(msg: KlasaMessage,[word,to,p,p1,p2,p3]:[string,string?,string?,string?,string?,string?]): Promise<KlasaMessage | KlasaMessage[] | null>{
        const arr:{k:string,v?:string,p?:string,p1?:string,p2?:string,p3?:string}[]=msg.guildSettings.get(GUILD_SETINGS.text2speechDictionary);
        const index=arr.findIndex(({k,v}:{k:string,v?:string})=>word===k);
        if(index<0){
            await msg.guildSettings.update(GUILD_SETINGS.text2speechDictionary.join("."),{k:word,v:to,p,p1,p2,p3},{action:"add"});
            return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS);
        }
        await msg.guildSettings.update(GUILD_SETINGS.text2speechDictionary.join("."),{k:word,v:to,p,p1,p2,p3},{action:"overwrite",arrayPosition:index});
        return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS);
    }

}