import { Client, ColorResolvable } from "discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { MonitorRunner } from "monitor-discord.js";
import Engine from "../text2speech/engine";
import { InstanceState } from "../util/instance-state";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";
import forUpdatePrefix_guildMemberUpdate from "../events-v2/forUpdatePrefix-guildMemberUpdate";
import forShowInvite_onceReady from "../events-v2/forShowInvite-onceReady";
import forUpdateInstanceState_onceReady from "../events-v2/forUpdateInstanceState-onceReady";
import forResumeConnection_ready from "../events-v2/forResumeConnection-ready";
import forAutoDisconnect_voiceStateUpdate from "../events-v2/forAutoDisconnect-voiceStateUpdate";
import forMonitor_message from "../events-v2/forMonitor-message";
import forMonitor_messageUpdate from "../events-v2/forMonitor-messageUpdate";
import forMonitor_onceReady from "../events-v2/forMonitor-onceReady";
import forErrorHandling_error from "../events-v2/forErrorHandling-error";

export type InitCoreEventsEnv = {
  basicBotConfig: BasicBotConfigRepository;
  instanceState: InstanceState;
  color: ColorResolvable;
  engine: Engine;
  dataStore: TextToSpeechTargetChannelDataStore;
  monitorRunner: MonitorRunner;
  inviteLink: string;
};
export function initCoreEvents(client: Client, env: InitCoreEventsEnv): void {
  forUpdatePrefix_guildMemberUpdate(client, env.basicBotConfig);
  forShowInvite_onceReady(client, env.inviteLink);
  forUpdateInstanceState_onceReady(client, env.instanceState, env.color);
  forResumeConnection_ready(client);
  forAutoDisconnect_voiceStateUpdate(client, env.engine, env.dataStore);
  forMonitor_message(client, env.monitorRunner);
  forMonitor_messageUpdate(client, env.monitorRunner);
  forMonitor_onceReady(client, env.monitorRunner);
  forErrorHandling_error(client);
}
