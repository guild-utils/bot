import { Client } from "discord.js";
import { initCoreEvents, InitCoreEventsEnv } from "presentation_core";
export type InitEventsEnv = InitCoreEventsEnv;
export function initEvents(client: Client, env: InitEventsEnv): void {
  initCoreEvents(client, env);
}
