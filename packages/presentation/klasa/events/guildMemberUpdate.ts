import { Event ,EventStore} from "klasa";
import { GuildMember } from "discord.js";
import * as SETTING_KEYS from "../guild_settings_keys";
import {  updateCounter } from "../counter/counter";
import { COUNTER_TARGET_ROLE, COUNTER_FORMAT, COUNTER_TYPE } from "../channel_settings_keys";

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
            const counterType:unknown=settings.get(COUNTER_TYPE);
            if(typeof counterType!=="string"){
                return;
            }
            switch(counterType){
                case "role":
                    const roleId:string=settings.get(COUNTER_TARGET_ROLE);
                    if(changedRoleIds.has(roleId)){
                        const format=settings.get(COUNTER_FORMAT);
                        const role=oldMember.guild.roles.resolve(roleId);
                        if(!role){
                            return;
                        }
                        await updateCounter(counterDisplayChannel,role,format);
                    }
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
