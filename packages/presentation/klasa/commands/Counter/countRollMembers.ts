import {Command,CommandStore,KlasaMessage} from "klasa";
import * as LANG_KEYS from "../../lang_keys";
import { Role } from "discord.js";

export default class extends Command{
    constructor(store: CommandStore, file: string[], directory: string) {
        super(store,file,directory,{
            usage:"<targetRole:role>",
            runIn:["text"],
            requiredPermissions:["MANAGE_ROLES"],
            description:lang=>lang.get(LANG_KEYS.COMMAND_RECOUNT_DESCRIPTION)
        });
    }
    async run(message: KlasaMessage,[role]:[Role]): Promise<KlasaMessage | KlasaMessage[] | null>{
        await message.guild!.members.fetch();
        return message.sendMessage(`${role}:${role.members.reduce((a,e)=>a+1,0)}`);
    }
}