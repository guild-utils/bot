import { Extendable, ExtendableStore } from "klasa";
import { CategoryChannel, TextChannel, VoiceChannel, DMChannel, Guild} from "discord.js";
import { Settings } from "klasa";
import { GatewayDriver } from "klasa";
import { Schema } from "klasa";
declare module "klasa"{
    interface GatewayDriver{
        channels:Gateway
    }
}

export default class extends Extendable {
    private id!:string
    private guild!:Guild
    constructor(store: ExtendableStore, file: string[], directory: string) {
        super(store,file,directory,{appliesTo: [TextChannel,VoiceChannel,DMChannel,CategoryChannel]} );
    }

    get settings() {
        return this.client.gateways.channels.get(`${this.guild.id}-${this.id}`, true);
    }

};
declare module 'discord.js'{
    interface Channel{
        settings:Settings
    }
}
export function initChannelsGateway(gateways:GatewayDriver){
    return gateways.register('channels', {
        schema:new Schema()
            .add("counter",f=>{
                f.add("role","role")
                f.add("format","string")
                f.add("type","string")
            })
    });
}
