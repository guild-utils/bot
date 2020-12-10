import { Client, ColorResolvable } from "discord.js";
import { BasicBotConfigRepository } from "domain_guild-configs";
import { MonitorRunner } from "monitor-discord.js";
import Engine from "../text2speech/engine";
import { InstanceState } from "../util/instance-state";
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";
import forUpdatePrefix_guildMemberUpdate from "../events/forUpdatePrefix-guildMemberUpdate";
import forShowInvite_onceReady from "../events/forShowInvite-onceReady";
import forUpdateInstanceState_onceReady from "../events/forUpdateInstanceState-onceReady";
import forResumeConnection_ready from "../events/forResumeConnection-ready";
import forAutoDisconnect_voiceStateUpdate from "../events/forAutoDisconnect-voiceStateUpdate";
import forMonitor_message from "../events/forMonitor-message";
import forMonitor_messageUpdate from "../events/forMonitor-messageUpdate";
import forMonitor_onceReady from "../events/forMonitor-onceReady";
import forErrorHandling_error from "../events/forErrorHandling-error";

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
