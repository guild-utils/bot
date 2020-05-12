import {Command,CommandStore,KlasaMessage} from "klasa";
import * as LANG_KEYS from "../../lang_keys";
import * as SETTING_KEYS from "../../guild_settings_keys";
import { TextChannel, Role, VoiceChannel } from "discord.js";
import { recount, counterTypes } from "../../counter/counter";
import { COUNTER_FORMAT, COUNTER_TARGET_ROLE, COUNTER_TYPE } from "../../channel_settings_keys";

export default class extends Command{
    constructor(store: CommandStore, file: string[], directory: string) {
        super(store,file,directory,{
            usage:"<displayTextChannel:textChannel|displayVoiceChannel:voiceChannel> <targetRole:role|target:string> <format:string>",
            usageDelim:",",
            runIn:["text"],
            description:lang=>lang.get(LANG_KEYS.COMMAND_SET_DESCRIPTION)
        });
    }
    async run(message: KlasaMessage, [displayChannel,target,format]:[VoiceChannel|TextChannel,Role|string,string]): Promise<KlasaMessage | KlasaMessage[] | null>{

        const permissionsOnDisplayChannelForBot=displayChannel.permissionsFor(this.client.user!);
        if(!(permissionsOnDisplayChannelForBot&&permissionsOnDisplayChannelForBot.has("MANAGE_CHANNELS"))){
            return message.sendLocale(LANG_KEYS.COMMAND_SET_BOT_DONT_HAVE_MANGE_CHANNEL_PERMISSON_ON_TARGET_CHANNEL,[displayChannel]);
        }
        const permissionsOnDisplayChannelForYou=displayChannel.permissionsFor(message.author);

        if(!(permissionsOnDisplayChannelForYou&&permissionsOnDisplayChannelForYou.has("MANAGE_CHANNELS"))){
            return message.sendLocale(LANG_KEYS.COMMAND_SET_YOU_DONT_HAVE_MANGE_CHANNEL_PERMISSON_ON_TARGET_CHANNEL,[displayChannel]);
        }
        await displayChannel.settings.reset([COUNTER_FORMAT.join("."),COUNTER_TYPE.join("."),COUNTER_TARGET_ROLE.join(".")]);
        const r=await message.guildSettings.update(SETTING_KEYS.counterDisplayChannels.join("."),displayChannel,{action:"overwrite"});
        const counterType=typeof target==="string"?target:"role";
        if(target==="role"){
            return message.sendLocale(LANG_KEYS.COMMAND_SET_INVALID_TARGET);
        }
        if(!counterTypes.includes(counterType)){
            return message.sendLocale(LANG_KEYS.COMMAND_SET_INVALID_TARGET);
        }
        const conf:[string,string|Role][]=[[COUNTER_FORMAT.join("."),format],[COUNTER_TYPE.join("."),counterType]];
        if(counterType==="role"&&typeof target!=="string"){
            conf.push([COUNTER_TARGET_ROLE.join("."),target])
        }
        const r2=await displayChannel.settings.update(conf,displayChannel);
        if(r.errors.length===0&&r2.errors.length===0){
            await recount(message.guild!);
            return message.sendLocale(LANG_KEYS.COMMAND_SET_SUCCESS);
        }
        const promises:Promise<KlasaMessage>[]=[];
        if(r.errors.length!==0){
            promises.push(
                message.sendMessage(r.errors)
            );
        }
        if(r2.errors.length!==0){
            promises.push(
                message.sendMessage(r2.errors)
            );
        }
        
        return Promise.all(promises);
    }
}