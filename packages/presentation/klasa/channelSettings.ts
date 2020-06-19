import { Settings } from "klasa";
import { GatewayDriver } from "klasa";
import { Schema } from "klasa";
const { Structures } = require('discord.js');

declare module "klasa"{
    interface GatewayDriver{
        channels:Gateway
    }
}

for(let sname of ["TextChannel","DMChannel","VoiceChannel","CategoryChannel","NewsChannel","StoreChannel"]){
    Structures.extend(sname, Channel => {

        class Pwrd_Events_Channel extends Channel {
            constructor(...args) {
                super(...args);
                this.settings = this.client.gateways.channels.get(this.id, true);
            }
            toJSON() {
                return { ...super.toJSON(), settings: this.settings.toJSON() };
            }
    
        }
        return Pwrd_Events_Channel;
    });
}

declare module 'discord.js'{
    interface Channel{
        settings:Settings
    }
}
export function initChannelsGateway(gateways:GatewayDriver){
    return gateways.register('channels', {
        schema:new Schema()
    });
}
