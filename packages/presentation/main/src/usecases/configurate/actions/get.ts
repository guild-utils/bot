import {
  GuildVoiceConfig,
  LayeredVoiceConfig,
} from "domain_voice-configs-write";
import { CheckFunction, GetFunction, getWithRecord } from "presentation_core";
import {
  ConfigurateUsecase,
  ExecutorType,
  GetResponseType,
  TargetType,
} from "protocol_configurate-usecase";
import { MainConfigurateKeys } from "../keys";
import { Repositorys } from "../util";
type RepresentsTargetType = {
  guild?: string | undefined;
  user?: string | undefined;
  member?: [string, string] | undefined;
};
function makeLayeredPropGetterMember(
  repo: Repositorys,
  k: keyof LayeredVoiceConfig
): (t: RepresentsTargetType) => Promise<GetResponseType> {
  return async (t) => {
    if (!t.member) {
      return {};
    }
    const r = (await repo.memberVoiceConfig.get(t.member)) ?? {};
    return {
      member: r[k],
    };
  };
}
function makeLayeredPropGetterUser(
  repo: Repositorys,
  k: keyof LayeredVoiceConfig
): (lk: RepresentsTargetType) => Promise<GetResponseType> {
  return async (t) => {
    if (!t.user) {
      return {};
    }
    const r = (await repo.userVoiceConfig.get(t.user)) ?? {};
    return {
      user: r[k],
    };
  };
}
function makePropGetterGuild(
  repo: Repositorys,
  k: keyof GuildVoiceConfig
): (lk: RepresentsTargetType) => Promise<GetResponseType> {
  return async (t) => {
    if (!t.guild) {
      return {};
    }
    const r = (await repo.guildVoiceConfig.get(t.guild)) ?? {};
    return {
      guild: r[k],
    };
  };
}
function makePropGetterMU(repo: Repositorys, k: keyof LayeredVoiceConfig) {
  const mg = makeLayeredPropGetterMember(repo, k);
  const ug = makeLayeredPropGetterUser(repo, k);
  return async (t: RepresentsTargetType) => {
    const mv = await mg(t);
    const uv = await ug(t);
    return Object.assign({}, mv, uv);
  };
}
function makePropGetterMUG(
  repo: Repositorys,
  k: keyof LayeredVoiceConfig & keyof GuildVoiceConfig
) {
  const mug = makePropGetterMU(repo, k);
  const gg = makePropGetterGuild(repo, k);
  return async (t: RepresentsTargetType) => {
    const umv = await mug(t);
    const gv = await gg(t);
    return Object.assign({}, umv, gv);
  };
}
function representsTarget(
  t: TargetType,
  exec: ExecutorType
): RepresentsTargetType {
  if (t == null) {
    return {
      guild: exec.guild,
      user: exec.user,
      member: exec.guild ? [exec.guild, exec.user] : undefined,
    };
  }
  return t;
}
type PropGetter<K> = (
  repo: Repositorys,
  k: K
) => (t: RepresentsTargetType) => Promise<GetResponseType>;
export default function (
  repo: Repositorys,
  checkGet: CheckFunction
): ConfigurateUsecase["get"] {
  function build<K>(f: PropGetter<K>, k: K) {
    return async (t: TargetType, exec: ExecutorType) => {
      const rt = representsTarget(t, exec);
      await checkGet(rt, exec);
      const r = f(repo, k)(rt);
      return r;
    };
  }
  const getSpeechReadName: GetFunction = build(makePropGetterMUG, "readName");
  const getSpeechMaxReadLimit = build(makePropGetterGuild, "maxReadLimit");
  const getSpeechMaxVolume = build(makePropGetterGuild, "maxVolume");
  const getRandomizer = build(makePropGetterMUG, "randomizer");
  const makeLayeredPropGetter = (k: keyof LayeredVoiceConfig) =>
    build(makePropGetterMU, k);
  const m: Record<MainConfigurateKeys, GetFunction> = {
    "speech.readName": getSpeechReadName,
    readName: getSpeechReadName,
    "speech.maxReadLimit": getSpeechMaxReadLimit,
    maxReadLimit: getSpeechMaxReadLimit,
    "speech.maxVolume": getSpeechMaxVolume,
    maxVolume: getSpeechMaxVolume,
    "speech.randomizer": getRandomizer,
    randomizer: getRandomizer,
    allpass: makeLayeredPropGetter("allpass"),
    "speech.allpass": makeLayeredPropGetter("allpass"),
    intone: makeLayeredPropGetter("intone"),
    "speech.intone": makeLayeredPropGetter("intone"),
    speed: makeLayeredPropGetter("speed"),
    "speech.speed": makeLayeredPropGetter("speed"),
    threshold: makeLayeredPropGetter("threshold"),
    "speech.threshold": makeLayeredPropGetter("threshold"),
    tone: makeLayeredPropGetter("tone"),
    "speech.tone": makeLayeredPropGetter("tone"),
    volume: makeLayeredPropGetter("volume"),
    "speech.volume": makeLayeredPropGetter("volume"),
    kind: makeLayeredPropGetter("kind"),
    "speech.kind": makeLayeredPropGetter("kind"),
  };
  return getWithRecord(m);
}
