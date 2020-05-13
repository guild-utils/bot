import { Event ,EventStore} from "klasa";
import { GuildMember } from "discord.js";
import {  recount } from "../counter/counter";

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
        return recount(member.guild!);
    }
}