import { Event ,EventStore} from "klasa";
import { GuildMember } from "discord.js";
import { guildMemberIO } from "../counter/counter";

export default class extends Event {
    constructor(
        store: EventStore, 
        file: string[], 
        directory: string
    ) {
		super(store,file,directory,{
			event: 'guildMemberRemove'
        });
    }
    run(member:GuildMember){
        return guildMemberIO(member);
    }
}