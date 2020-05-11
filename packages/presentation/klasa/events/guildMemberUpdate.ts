import { Event ,EventStore} from "klasa";
import { autoInjectable } from "tsyringe";
import { GuildMember } from "discord.js";
import * as SETTING_KEYS from "../guild_settings_keys";
import {  updateCounter } from "../counter/counter";
import { COUNTER_ROLE, COUNTER_FORMAT } from "../channel_settings_keys";

@autoInjectable()
export default class extends Event {
    constructor(
        store: EventStore, 
        file: string[], 
        directory: string
    ) {
		super(store,file,directory,{
			event: 'guildMemberUpdate'
        });
    }
    async run(oldMember:GuildMember,newMember:GuildMember){
        const counterDisplayChannelIds:string[]=oldMember.guild.settings.get(SETTING_KEYS.counterDisplayChannels);
        if(counterDisplayChannelIds.length===0){
            return;
        }
        const oldRoles=oldMember.roles.cache.array();
        const newRoles=newMember.roles.cache.array();
        const oldRoleIds=oldRoles.map(e=>e.id);
        const newRoleIds=newRoles.map(e=>e.id);
        if(eqSet(new Set(oldRoleIds),new Set(newRoleIds))){
            console.log("role eq")
            return;
        }        
        const changedRoleIds=new Set([...oldRoleIds,...newRoleIds]);
        
        const promises=counterDisplayChannelIds.map(async e=>{
            const counterDisplayChannel=oldMember.guild.channels.resolve(e);
            if(!counterDisplayChannel){
                return;
            }
            const settings=counterDisplayChannel.settings;
            await settings.sync();
            const roleId:string=settings.get(COUNTER_ROLE);
            if(changedRoleIds.has(roleId)){
                const format=settings.get(COUNTER_FORMAT);
                const role=oldMember.guild.roles.resolve(roleId);
                if(!role){
                    return;
                }
                await updateCounter(counterDisplayChannel,role,format);
            }

        })
        return Promise.all(promises);
    }
}


function eqSet(as:Set<any>, bs:Set<any>) {
    if (as.size !== bs.size) return false;
    for (let a of as) if (!bs.has(a)) return false;
    return true;
}
