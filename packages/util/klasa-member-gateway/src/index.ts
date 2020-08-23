import "./lib/extensions/KlasaGuild";
import "./lib/extensions/KlasaMember";
import { KlasaClient, Settings } from "klasa";
import MemberGateway from "./lib/settings/MemberGateway";
declare module "discord.js" {
  export interface GuildMember {
    settings: Settings;
  }
}
declare module "klasa" {
  export interface GatewayDriver {
    members: MemberGateway;
  }
}
import Client from "./lib/Client";
export default {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  [KlasaClient.plugin]: Client[KlasaClient.plugin],
};
export { Client, MemberGateway };
