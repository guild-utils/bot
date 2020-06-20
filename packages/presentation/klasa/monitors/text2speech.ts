import { Monitor } from "klasa";
import { KlasaMessage } from "klasa";
import {  text2speechTargetTextChannels } from '../guild_settings_keys';
import { MonitorStore } from "klasa";
import Engine from '../text2speech/engine';
import { inject, autoInjectable } from "tsyringe";
import * as USER_SETTINGS from "../user_settings_keys";
import * as GUILD_SETINGS from "../guild_settings_keys";
const urlRegex=/https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+/
const markRegex=/^[!"#$%&'()\*\+\-\.,\/:;<=>?\[\\\]^_`{|}~].*/;
@autoInjectable()
export default class extends Monitor {
    constructor(store: MonitorStore, file: string[], directory: string,@inject("engine") private readonly engine:Engine) {
        super(store,file,directory, {
            name: 'text2speech',
            enabled: true,
            ignoreBots: true,
            ignoreSelf: true,
            ignoreOthers: false,
            ignoreWebhooks: true,
            ignoreEdits: true,
            ignoreBlacklistedUsers: true,
            ignoreBlacklistedGuilds: true
        });
    }

    async run(message:KlasaMessage) {
        if(!message.guild){
            return;
        }
        const targets:string[]=message.guildSettings.get(text2speechTargetTextChannels);
        if(!targets.includes(message.channel.id)){
            return;
        }
        if(!message.guild.voice?.connection){
            message.guildSettings.reset(text2speechTargetTextChannels);
            return;
        }
        let content=message.content;
        if(content.startsWith(";")){
            return;
        }
        content=content.replace(/\<\@\!?(\d+)\>/g,(e,m)=>{
            const member=message.guild?.members.resolve(m);
            return member?.user.settings.get(USER_SETTINGS.text2speechReadName)??member?.displayName??"";
        });
        if(markRegex.test(content)){
            return;
        }
        content=content.replace(urlRegex,"\nURL省略\n");


        const kind=message.member?.user.settings.get(USER_SETTINGS.text2speechKind);
        let speed=message.member?.user.settings.get(USER_SETTINGS.text2speechSpeed);
        if(speed<0.5){
            speed=0.5;
        }

        const tone=message.member?.user.settings.get(USER_SETTINGS.text2speechTone);
        const volume=message.member?.user.settings.get(USER_SETTINGS.text2speechVolume);
        const readName=message.guildSettings.get(GUILD_SETINGS.text2speechReadName)?
            message.member?.user.settings.get(USER_SETTINGS.text2speechReadName)??message.member!.displayName
                :undefined;
        const dictionaryArr=message.guildSettings.get(GUILD_SETINGS.text2speechDictionary);
        console.log(dictionaryArr)
        const dictionary:{[k in string]:{k:string,v?:string,p?:string,p1?:string,p2?:string,p3?:string}}={};
        for(let entry  of dictionaryArr){
            dictionary[entry.k]=entry;
        }
        this.engine.queue(message.guild.voice.connection,content,{kind,speed,tone,volume,readName,dictionary});
    }

};