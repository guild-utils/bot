import { Monitor } from "klasa";
import { KlasaMessage } from "klasa";
import {  text2speechTargetTextChannels } from '../guild_settings_keys';
import { MonitorStore } from "klasa";
import Engine from '../text2speech/engine';
import { inject, autoInjectable } from "tsyringe";
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
        console.log(message.content)

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
        this.engine.queue(message.guild.voice.connection,message.content,{kind:"normal",speed:1.0,tone:1.0})
    }

};