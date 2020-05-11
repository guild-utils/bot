import { Role, GuildChannel, Guild } from "discord.js";
const fillTemplate = require('es6-dynamic-template');
import * as SETTING_KEYS from "../guild_settings_keys";
import { COUNTER_ROLE, COUNTER_FORMAT } from "../channel_settings_keys";

export function countRoleMembers(role:Role){
    return role.members.reduce((a,e)=>a+1,0);
}
export async function updateCounter(displayChannel:GuildChannel,role:Role,format:string){
    await displayChannel.setName(fillTemplate(format,{count:"?"}));
    const count=countRoleMembers(role);
    return await displayChannel.setName(fillTemplate(format,{count}));
}
export function recount(guild:Guild){
    const channels:string[]=guild.settings.get(SETTING_KEYS.counterDisplayChannels)
    const promises=channels.map(async (e:string)=>{
        const displayChannel=guild.channels.resolve(e);
        if(!displayChannel){
            return;
        }
        const settings=displayChannel.settings;
        await settings.sync();
        const roleId:string=settings.get(COUNTER_ROLE);
        const role=guild.roles.resolve(roleId);
        if(!role){
            return;
        }
        const format=settings.get(COUNTER_FORMAT);
        await updateCounter(displayChannel,role,format);
    });
    return promises;
}
