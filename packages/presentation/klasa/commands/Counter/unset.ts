import {Command,CommandStore,KlasaMessage} from "klasa";
import * as LANG_KEYS from "../../lang_keys";
import * as SETTING_KEYS from "../../guild_settings_keys";
import { TextChannel,  VoiceChannel } from "discord.js";
import { COUNTER_FORMAT, COUNTER_TARGET_ROLE, COUNTER_TYPE } from "../../channel_settings_keys";

export default class extends Command{
    constructor(store: CommandStore, file: string[], directory: string) {
        super(store,file,directory,{
            usage:"<displayTextChannel:textChannel|displayVoiceChannel:voiceChannel>",
            runIn:["text"],
            requiredPermissions:["MANAGE_CHANNELS"],
            description:lang=>lang.get(LANG_KEYS.COMMAND_UNSET_DESCRIPTION)
        });
    }
    async run(message: KlasaMessage, [displayChannel]:[VoiceChannel|TextChannel]): Promise<KlasaMessage | KlasaMessage[] | null>{
        await displayChannel.settings.reset([COUNTER_FORMAT.join("."),COUNTER_TYPE.join("."),COUNTER_TARGET_ROLE.join(".")]);
        message.guildSettings.update(SETTING_KEYS.counterDisplayChannels.join("."),displayChannel,{action:"remove"});
        return message.sendLocale(LANG_KEYS.COMMAND_UNSET_SUCCESS);
    }
}