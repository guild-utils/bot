import {Command,CommandStore,KlasaMessage} from "klasa";
import { Role } from "discord.js";
import { COMMAND_ADD_ROLE_COMMON_YOU_HAVENT_MANAGE_ROLE_PERMISSION, COMMAND_ADD_ROLE_COMMON_YOUR_HIGHEST_ROLE_IS_LOWER_THAN_TARGET_ROLE } from "../../lang_keys";

export default class extends Command{
    constructor(store: CommandStore, file: string[], directory: string) {
        super(store,file,directory,{
            usage:"<role:role> <count:number>",
            usageDelim:" ",
            runIn:["text"],
            requiredPermissions:["MANAGE_ROLES"],
        });
    }
    async run(message: KlasaMessage, [role,count]:[Role,number]): Promise<KlasaMessage | KlasaMessage[] | null>{
        if(!message.member!.hasPermission("MANAGE_ROLES")){
            return message.sendLocale(COMMAND_ADD_ROLE_COMMON_YOU_HAVENT_MANAGE_ROLE_PERMISSION);
        }
        if(message.member!.roles.highest.position<=role.position){
            return message.sendLocale(COMMAND_ADD_ROLE_COMMON_YOUR_HIGHEST_ROLE_IS_LOWER_THAN_TARGET_ROLE);
        }
        const s=message.guild!.members.cache.array().filter(e=>!e.user.bot).sort((a,b)=>(a.joinedTimestamp! < b.joinedTimestamp! ? -1 : 1));
        s.length=count;
        await Promise.all(s.map(e=>e.roles.add(role)));

        return message.sendMessage(`role member count:${role.members.array().length}`);
    }
}