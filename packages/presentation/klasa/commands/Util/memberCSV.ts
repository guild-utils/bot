import {Command,CommandStore,KlasaMessage} from "klasa";
import { Role, MessageAttachment } from "discord.js";

export default class extends Command{
    constructor(store: CommandStore, file: string[], directory: string) {
        super(store,file,directory,{
            usage:"[role:role]",
            runIn:["text"],
        });
    }
    async run(message: KlasaMessage, [role]:[Role|undefined]): Promise<KlasaMessage | KlasaMessage[] | null>{
        await message.guild!.members.fetch();
        if(!role){
            const members=message.guild!.members.cache.array();
            const buf=Buffer.from(members.map(e=>e.displayName).join("\n"), 'utf-8');
            const attr=new MessageAttachment(buf,"member.csv");
            return await message.send(attr);
        }
        const buf=Buffer.from(role.members.array().map(e=>e.displayName).join("\n"),'utf-8');
        const attr=new MessageAttachment(buf,`${role.name}.csv`);
        return await message.send(attr);
    }
}