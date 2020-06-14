import { Monitor } from "klasa";
import { KlasaMessage } from "klasa";
import {  text2speechTargetTextChannels } from '../guild_settings_keys';
import { MonitorStore } from "klasa";
import Engine from '../text2speech/engine';
import { inject, autoInjectable } from "tsyringe";
import * as USER_SETTINGS from "../user_settings_keys";
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
        const kind=message.member?.user.settings.get(USER_SETTINGS.text2speechKind);
        const speed=message.member?.user.settings.get(USER_SETTINGS.text2speechSpeed);
        const tone=message.member?.user.settings.get(USER_SETTINGS.text2speechTone);
        const volume=message.member?.user.settings.get(USER_SETTINGS.text2speechVolume);
        this.engine.queue(message.guild.voice.connection,message.content,{kind,speed,tone,volume});
    }

};