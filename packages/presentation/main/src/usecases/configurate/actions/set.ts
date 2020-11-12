import { ContextError } from "@guild-utils/command-schema";
import { ArgumentTypeMismatchError, AT_Bool } from "@guild-utils/command-types";
import { VoiceKindArray } from "domain_meta";
import {
  CheckFunction,
  SetFunction,
  setWithRecord,
  Pipelines,
  guildOnly,
} from "presentation_core";
import {
  ConfigurateUsecase,
  ConfigurateUsecaseResultType,
  ConfigurateUsecaseResultTypeSingle,
  ExecutorType,
  TargetType,
} from "protocol_configurate-usecase";
import { MainConfigurateKeys } from "../keys";
import { Repositorys, UpdateEnv } from "../util";
type MakeFloatLayeredPropSetterKeyType =
  | "setAllpass"
  | "setIntone"
  | "setSpeed"
  | "setThreshold"
  | "setTone"
  | "setVolume";
function makeFloatLayeredPropSetterProcess(
  k: MakeFloatLayeredPropSetterKeyType,
  { checkUpdate, memberVoiceConfig, userVoiceConfig }: UpdateEnv
): SetFunction {
  return async (
    t: TargetType,
    v: unknown,
    exec: ExecutorType
  ): Promise<ConfigurateUsecaseResultType> => {
    if (t?.guild) {
      throw new ContextError();
    } else if (t?.member || t?.user) {
      const vv = v === undefined ? v : Number(v);
      if (vv !== undefined && !Number.isFinite(vv)) {
        throw new ArgumentTypeMismatchError();
      }
      await checkUpdate(t, exec);
      const promises: Promise<ConfigurateUsecaseResultTypeSingle>[] = [];
      if (t.member) {
        promises.push(
          memberVoiceConfig[k](t.member, vv).then(
            Pipelines.memberSingle(t.member)
          )
        );
      }
      if (t.user) {
        promises.push(
          userVoiceConfig[k](t.user, vv).then(Pipelines.userSingle(t.user))
        );
      }
      return Promise.all(promises);
    } else {
      const vv = v === undefined ? v : Number(v);
      if (vv !== undefined && !Number.isFinite(vv)) {
        throw new ArgumentTypeMismatchError();
      }
      if (exec.guild) {
        const member: [string, string] = [exec.guild, exec.user];
        await checkUpdate({ member }, exec);
        return memberVoiceConfig[k](member, vv).then(
          Pipelines.memberSingle(member)
        );
      } else {
        await checkUpdate({ user: exec.user }, exec);
        return userVoiceConfig[k](exec.user, vv).then(
          Pipelines.userSingle(exec.user)
        );
      }
    }
  };
}
async function setSpeechReadNameProcess(
  t: TargetType,
  v: unknown,
  exec: ExecutorType,
  {
    memberVoiceConfig,
    checkUpdate,
    userVoiceConfig,
    guildVoiceConfig,
  }: UpdateEnv
): Promise<ConfigurateUsecaseResultType> {
  if (t?.guild) {
    if (t.member || t.user) {
      throw new ContextError();
    }
    const vv = await new AT_Bool().resolve(v);
    await checkUpdate(t, exec);
    return guildVoiceConfig
      .setReadName(t.guild, vv)
      .then(Pipelines.guildSingle(t.guild));
  } else if (t?.member || t?.user) {
    if (typeof v !== "string" && v !== undefined) {
      throw new ArgumentTypeMismatchError();
    }
    await checkUpdate(t, exec);
    const promises: Promise<ConfigurateUsecaseResultTypeSingle>[] = [];
    const member = t.member;
    if (member) {
      promises.push(
        memberVoiceConfig
          .setReadName(member, v)
          .then(Pipelines.memberSingle(member))
      );
    }
    const user = t.user;
    if (user) {
      promises.push(
        userVoiceConfig.setReadName(user, v).then(Pipelines.userSingle(user))
      );
    }
    return Promise.all(promises);
  } else {
    if (typeof v !== "string" && v !== undefined) {
      throw new ArgumentTypeMismatchError();
    }
    if (exec.guild) {
      const member: [string, string] = [exec.guild, exec.user];
      await checkUpdate({ member }, exec);
      return memberVoiceConfig
        .setReadName(member, v)
        .then(Pipelines.memberSingle(member));
    } else {
      await checkUpdate({ user: exec.user }, exec);
      return userVoiceConfig
        .setReadName(exec.user, v)
        .then(Pipelines.userSingle(exec.user));
    }
  }
}
async function setSpeechMaxReadLimitProcess(
  t: TargetType,
  v: unknown,
  exec: ExecutorType,
  { checkUpdate, guildVoiceConfig }: UpdateEnv
) {
  const guild = guildOnly(t, exec);
  await checkUpdate({ guild }, exec);
  const vv = v === undefined ? v : Number(v);
  if (vv !== undefined && !Number.isInteger(vv)) {
    throw new ArgumentTypeMismatchError();
  }
  return guildVoiceConfig
    .setMaxReadLimit(guild, vv)
    .then(Pipelines.guildSingle(guild));
}
async function setSpeechMaxVolumeProcess(
  t: TargetType,
  v: unknown,
  exec: ExecutorType,
  { checkUpdate, guildVoiceConfig }: UpdateEnv
): Promise<ConfigurateUsecaseResultTypeSingle> {
  const guild = guildOnly(t, exec);
  await checkUpdate({ guild }, exec);
  const vv = v === undefined ? v : Number(v);
  if (vv !== undefined && !Number.isFinite(vv)) {
    throw new ArgumentTypeMismatchError();
  }
  await checkUpdate({ guild }, exec);
  return guildVoiceConfig
    .setMaxVolume(guild, vv)
    .then(Pipelines.guildSingle(guild));
}
async function setRandomizerProcess(
  t: TargetType,
  v: unknown,
  exec: ExecutorType,
  {
    checkUpdate,
    guildVoiceConfig,
    memberVoiceConfig,
    userVoiceConfig,
  }: UpdateEnv
): Promise<ConfigurateUsecaseResultType> {
  if (v !== "v1" && v !== "v2" && v !== undefined) {
    throw new ArgumentTypeMismatchError();
  }
  const promises: Promise<ConfigurateUsecaseResultTypeSingle>[] = [];
  if (t?.guild || t?.user || t?.member) {
    await checkUpdate(t, exec);
    if (t.guild) {
      promises.push(
        guildVoiceConfig
          .setRandomizer(t.guild, v)
          .then(Pipelines.guildSingle(t.guild))
      );
    }
    if (t.user) {
      promises.push(
        userVoiceConfig
          .setRandomizer(t.user, v)
          .then(Pipelines.userSingle(t.user))
      );
    }
    if (t.member) {
      promises.push(
        memberVoiceConfig
          .setRandomizer(t.member, v)
          .then(Pipelines.memberSingle(t.member))
      );
    }
    return Promise.all(promises);
  } else {
    if (exec.guild) {
      const member: [string, string] = [exec.guild, exec.user];
      await checkUpdate({ member }, exec);
      return memberVoiceConfig
        .setRandomizer(member, v)
        .then(Pipelines.memberSingle(member));
    } else {
      await checkUpdate({ user: exec.user }, exec);
      return userVoiceConfig
        .setRandomizer(exec.user, v)
        .then(Pipelines.userSingle(exec.user));
    }
  }
}

async function setSpeechKindProcess(
  t: TargetType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  v: any,
  exec: ExecutorType,
  { checkUpdate, memberVoiceConfig, userVoiceConfig }: UpdateEnv
): Promise<ConfigurateUsecaseResultType> {
  if (v !== undefined && !VoiceKindArray.includes(v)) {
    throw new ArgumentTypeMismatchError();
  }
  if (t?.guild) {
    throw new ContextError();
  } else if (t?.member || t?.user) {
    await checkUpdate(t, exec);
    const promises: Promise<ConfigurateUsecaseResultTypeSingle>[] = [];
    if (t.member) {
      promises.push(
        memberVoiceConfig
          .setKind(t.member, v)
          .then(Pipelines.memberSingle(t.member))
      );
    }
    if (t.user) {
      promises.push(
        userVoiceConfig.setKind(t.user, v).then(Pipelines.userSingle(t.user))
      );
    }
    return Promise.all(promises);
  } else {
    if (exec.guild) {
      const member: [string, string] = [exec.guild, exec.user];
      await checkUpdate({ member }, exec);
      return memberVoiceConfig
        .setKind(member, v)
        .then(Pipelines.memberSingle(member));
    } else {
      await checkUpdate({ user: exec.user }, exec);
      return userVoiceConfig
        .setKind(exec.user, v)
        .then(Pipelines.userSingle(exec.user));
    }
  }
}
export default function (
  repo: Repositorys,
  checkUpdate: CheckFunction
): ConfigurateUsecase["set"] {
  const env: UpdateEnv = {
    ...repo,
    checkUpdate,
  };
  const setSpeechKind: SetFunction = (...args) =>
    setSpeechKindProcess(...args, env);
  const setSpeechReadName: SetFunction = (...args) =>
    setSpeechReadNameProcess(...args, env);
  const setSpeechMaxReadLimit: SetFunction = (...args) =>
    setSpeechMaxReadLimitProcess(...args, env);
  const setSpeechMaxVolume: SetFunction = (...args) =>
    setSpeechMaxVolumeProcess(...args, env);
  const setRandomizer: SetFunction = (...args) =>
    setRandomizerProcess(...args, env);
  const makeFloatLayeredPropSetter: (
    k: MakeFloatLayeredPropSetterKeyType
  ) => SetFunction = (k) => makeFloatLayeredPropSetterProcess(k, env);
  const m: Record<MainConfigurateKeys, SetFunction> = {
    "speech.readName": setSpeechReadName,
    readName: setSpeechReadName,
    "speech.maxReadLimit": setSpeechMaxReadLimit,
    maxReadLimit: setSpeechMaxReadLimit,
    "speech.maxVolume": setSpeechMaxVolume,
    maxVolume: setSpeechMaxVolume,
    "speech.randomizer": setRandomizer,
    randomizer: setRandomizer,
    allpass: makeFloatLayeredPropSetter("setAllpass"),
    "speech.allpass": makeFloatLayeredPropSetter("setAllpass"),
    intone: makeFloatLayeredPropSetter("setIntone"),
    "speech.intone": makeFloatLayeredPropSetter("setIntone"),
    speed: makeFloatLayeredPropSetter("setSpeed"),
    "speech.speed": makeFloatLayeredPropSetter("setSpeed"),
    threshold: makeFloatLayeredPropSetter("setThreshold"),
    "speech.threshold": makeFloatLayeredPropSetter("setThreshold"),
    tone: makeFloatLayeredPropSetter("setTone"),
    "speech.tone": makeFloatLayeredPropSetter("setTone"),
    volume: makeFloatLayeredPropSetter("setVolume"),
    "speech.volume": makeFloatLayeredPropSetter("setVolume"),
    kind: setSpeechKind,
    "speech.kind": setSpeechKind,
  };
  return setWithRecord(m);
}
