import {
  GuildVoiceConfigRepository,
  LayeredVoiceConfigRepository,
} from "domain_voice-configs-write";
import { CheckFunction } from "presentation_core";

export type Repositorys = {
  guildVoiceConfig: GuildVoiceConfigRepository;
  memberVoiceConfig: LayeredVoiceConfigRepository<[string, string]>;
  userVoiceConfig: LayeredVoiceConfigRepository<string>;
};
export type UpdateEnv = {
  checkUpdate: CheckFunction;
} & Repositorys;
