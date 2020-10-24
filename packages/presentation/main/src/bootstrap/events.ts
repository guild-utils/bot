import { Client } from "discord.js";
import { Gui } from "../gui/common";
import { initCoreEvents, InitCoreEventsEnv } from "presentation_core";
import forGui from "../events-v2/forGui";
export type InitEventsEnv = InitCoreEventsEnv & {
  guiControllers: Gui[];
};
export function initEvents(client: Client, env: InitEventsEnv): void {
  initCoreEvents(client, env);
  forGui(client, env.guiControllers);
}
