import {Command,CommandStore,KlasaMessage} from "klasa";
import * as LANG_KEYS from "../../lang_keys";
import { recount } from "../../counter/counter";

export default class extends Command{
    constructor(store: CommandStore, file: string[], directory: string) {
        super(store,file,directory,{
            usage:"",
            runIn:["text"],
            requiredPermissions:["MANAGE_CHANNELS"],
            description:lang=>lang.get(LANG_KEYS.COMMAND_RECOUNT_DESCRIPTION)
        });
    }
    async run(message: KlasaMessage): Promise<KlasaMessage | KlasaMessage[] | null>{
        await message.sendLocale(LANG_KEYS.COMMAND_RECOUNT_START);
        await recount(message.guild!);
        return message.sendLocale(LANG_KEYS.COMMAND_RECOUNT_SUCCESS);
    }
}