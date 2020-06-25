/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Settings } from "klasa";
import { GatewayDriver } from "klasa";
import { Schema } from "klasa";
import {
  Structures,
  CategoryChannel,
  DMChannel,
  NewsChannel,
  StoreChannel,
  TextChannel,
  VoiceChannel,
  Snowflake,
} from "discord.js";
import { Client } from "klasa";

declare module "klasa" {
  interface GatewayDriver {
    channels: Gateway;
  }
}
const targets: (
  | "TextChannel"
  | "DMChannel"
  | "VoiceChannel"
  | "CategoryChannel"
  | "NewsChannel"
  | "StoreChannel"
)[] = [
  "TextChannel",
  "DMChannel",
  "VoiceChannel",
  "CategoryChannel",
  "NewsChannel",
  "StoreChannel",
];
for (const sname of targets) {
  Structures.extend(
    sname,
    (
      ChannelClazz:
        | typeof TextChannel
        | typeof DMChannel
        | typeof VoiceChannel
        | typeof CategoryChannel
        | typeof NewsChannel
        | typeof StoreChannel
    ) => {
      class Pwrd_Events_Channel extends ChannelClazz {
        settings: Settings;
        id!: Snowflake;
        client!: Client;
        constructor(client: Client, data?: Record<string, unknown>) {
          super(client, data);
          this.settings = this.client.gateways.channels.get(this.id, true);
        }
        toJSON() {
          return { ...super.toJSON(), settings: this.settings.toJSON() };
        }
      }
      return Pwrd_Events_Channel as any;
    }
  );
}

declare module "discord.js" {
  interface Channel {
    settings: Settings;
  }
}
export function initChannelsGateway(gateways: GatewayDriver): GatewayDriver {
  return gateways.register("channels", {
    schema: new Schema(),
  });
}
