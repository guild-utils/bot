import { Role, GuildChannel, Guild } from "discord.js";
const fillTemplate = require('es6-dynamic-template');
import * as SETTING_KEYS from "../guild_settings_keys";
import {  COUNTER_FORMAT, COUNTER_TARGET_ROLE, COUNTER_TYPE } from "../channel_settings_keys";

export function countRoleMembers(role:Role){
    return role.members.reduce((a,e)=>a+1,0);
}
export function countHumans(displayChannel:GuildChannel){
    return displayChannel.guild.members.cache.reduce((r,e)=>{
        if(e.user.bot){
            return r;
        }
        return r+1;
    },0);
}
export function countBots(displayChannel:GuildChannel){
    return displayChannel.guild.members.cache.reduce((r,e)=>{
        if(e.user.bot){
            return r+1;
        }
        return r;
    },0);
}
function updateRoleCounter(displayChannel:GuildChannel,target:Role,format:string){
    const count=countRoleMembers(target);
    return displayChannel.setName(fillTemplate(format,{count}));
}
function updateHumanCounter(displayChannel:GuildChannel,format:string){
    const count=countHumans(displayChannel)
    return displayChannel.setName(fillTemplate(format,{count}));
}
function updateBotsCounter(displayChannel:GuildChannel,format:string){
    const count=countBots(displayChannel)
    return displayChannel.setName(fillTemplate(format,{count}));
}
function updateMemberCounter(displayChannel:GuildChannel,format:string){
    const count=displayChannel.guild.memberCount;
    return displayChannel.setName(fillTemplate(format,{count}));
}
export async function updateCounter(displayChannel:GuildChannel,target:Role|string,format:string){
    await displayChannel.setName(fillTemplate(format,{count:"?"}));
    if(typeof target!=="string"){
        await updateRoleCounter(displayChannel,target,format);
        return;
    }
    switch(target){
        case "human":
            await updateHumanCounter(displayChannel,format);
            return;
        case "bot":
            await updateBotsCounter(displayChannel,format);
            return;
        case "member":
            await updateMemberCounter(displayChannel,format);
            return;
    }
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
        const counterType=settings.get(COUNTER_TYPE);
        const format=settings.get(COUNTER_FORMAT);
        if(counterType!==counterTypeMap.role){
            updateCounter(displayChannel,counterType,format);
        }
        const roleId:string=settings.get(COUNTER_TARGET_ROLE);
        const role=guild.roles.resolve(roleId);
        if(!role){
            return;
        }
        await updateCounter(displayChannel,role,format);
    });
    return promises;
}
export const counterTypeMap={
    human:"human",
    bot:"bot",
    member:"member",
    role:"role"
};
export const counterTypes=Object.keys(counterTypeMap);