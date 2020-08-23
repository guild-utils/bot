import "discord.js";
import * as klasa from "klasa";
import { MemberGateway } from "../dist";
declare module "discord.js" {
  export interface GuildMember {
    settings: klasa.Settings;
  }
}
declare module "klasa" {
  export interface GatewayDriver {
    members: MemberGateway;
  }
}
