import * as Domain from "domain_voice-configs";
import {
  GuildVoiceConfigRepository,
  LayeredVoiceConfigRepository,
  LayeredVoiceConfig,
} from "domain_voice-configs-write";
import { randomizers, RandomizerReturnType } from "./randomizer";
const v1v2Boundary = 1598886000000; //2020/09/01 00:00:00 UTC+9
function select<
  T extends Record<string, unknown>,
  U extends keyof T,
  R extends T[U] | undefined
>(
  values: (T | undefined)[],
  key: U,
  defaultValue?: R
): R | Exclude<T[U], null | undefined> {
  for (const value of values) {
    if (!value) {
      continue;
    }
    const v = value[key] as Exclude<T[U], null | undefined> | null | undefined;
    if (v != undefined) {
      return v;
    }
  }
  if (arguments.length === 3) {
    return defaultValue as R;
  }
  throw new Error("Not Resolved");
}
function select2<
  T extends Record<string, unknown>,
  U extends keyof T,
  R extends T[U] | undefined
>(
  values: [T | undefined, string][],
  key: U,
  defaultValue?: [R, string]
): { value: R | Exclude<T[U], null | undefined>; provider: string } {
  for (const [rawvalue, provider] of values) {
    if (!rawvalue) {
      continue;
    }
    const value = rawvalue[key] as
      | Exclude<T[U], null | undefined>
      | null
      | undefined;
    if (value != undefined) {
      return { value, provider };
    }
  }
  if (arguments.length === 3) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { value: defaultValue![0], provider: defaultValue![1] };
  }
  throw new TypeError("Not Resolvable");
}
function readName(
  ms: string | undefined,
  us: string | undefined,
  nickName: string | undefined,
  userName: string
): string {
  return ms ?? nickName ?? us ?? userName;
}
type ReadName2ReturnType = { value: string; provider: string };
function readName2(
  ms: string | undefined,
  us: string | undefined,
  nickName: string | undefined,
  userName: string
): ReadName2ReturnType {
  let value = ms;
  let provider = "member";
  if (value) {
    return { value, provider };
  }
  value = nickName;
  provider = "nickname";
  if (value) {
    return { value, provider };
  }
  value = us;
  provider = "user";
  if (value) {
    return { value, provider };
  }
  value = userName;
  provider = "username";
  return { value, provider };
}
export interface ContextualDataResolver {
  getGuildJoinedTimeStamp(guild: string): Promise<number>;
}
export class Usecase implements Domain.Usecase {
  constructor(
    private readonly memberVoiceConfig: LayeredVoiceConfigRepository<
      [string, string]
    >,
    private readonly userVoiceConfig: LayeredVoiceConfigRepository<string>,
    private readonly guildVoiceConfig: GuildVoiceConfigRepository,
    private readonly dictionaryRepo: Domain.DictionaryRepository,
    private readonly contextualDataResolver: ContextualDataResolver
  ) {}
  async getUserReadNameResolvedBy(
    guild: string,
    user: string,
    nickname: string | undefined,
    username: string
  ): Promise<[string, string]> {
    const { value, provider } = readName2(
      (await this.memberVoiceConfig.get([guild, user]))?.readName,
      (await this.userVoiceConfig.get(user))?.readName,
      nickname,
      username
    );
    return [value, provider];
  }

  async appliedVoiceConfig(
    guild: string,
    user: string,
    nickName: string | undefined,
    userName: string
  ): Promise<Domain.AppliedVoiceConfig> {
    const [mss, uss, gvc] = await Promise.all([
      this.memberVoiceConfig.get([guild, user]),
      this.userVoiceConfig.get(user),
      this.guildVoiceConfig.get(guild),
    ]);
    let randomizerVersion = select([mss, uss, gvc], "randomizer", undefined);
    if (!randomizerVersion) {
      const joinedTimestamp = await this.contextualDataResolver.getGuildJoinedTimeStamp(
        guild
      );
      randomizerVersion = v1v2Boundary < joinedTimestamp ? "v2" : "v1";
    }
    const randomizerSupplier = randomizers[randomizerVersion] ?? randomizers.v1;
    const randomizer = randomizerSupplier({ user }).get();
    const allpass = select([mss, uss, randomizer], "allpass", undefined);
    const gws = [mss, uss, randomizer];
    return {
      dictionary: await this.dictionary(guild),
      kind: select(gws, "kind"),
      readName: gvc?.readName
        ? readName(mss?.readName, uss?.readName, nickName, userName)
        : undefined,
      speed: select(gws, "speed"),
      tone: select(gws, "tone"),
      volume: Math.min(
        gvc?.maxVolume ?? 5,
        select(gws, "volume", undefined) ?? 0
      ),
      maxReadLimit: gvc?.maxReadLimit ?? 130,
      allpass: allpass,
      intone: select(gws, "intone"),
      threshold: select(gws, "threshold"),
    };
  }
  async appliedVoiceConfigResolvedBy(
    guild: string,
    user: string,
    nickName: string | undefined,
    userName: string
  ): Promise<Domain.AppliedVoiceConfigResolvedBy> {
    const [gvc, mss, uss] = await Promise.all([
      this.guildVoiceConfig.get(guild),
      this.memberVoiceConfig.get([guild, user]),
      this.userVoiceConfig.get(user),
    ]);
    const ms: [LayeredVoiceConfig | undefined, string] = [mss, "member"];
    const us: [LayeredVoiceConfig | undefined, string] = [uss, "user"];
    let randomizerVersion = select([mss, uss, gvc], "randomizer", undefined);
    if (!randomizerVersion) {
      const joinedTimestamp = await this.contextualDataResolver.getGuildJoinedTimeStamp(
        guild
      );
      randomizerVersion = v1v2Boundary < joinedTimestamp ? "v2" : "v1";
    }
    const randomizerSupplier = randomizers[randomizerVersion] ?? randomizers.v1;
    const randomizer = randomizerSupplier({ user });
    const gws: [
      RandomizerReturnType | LayeredVoiceConfig | undefined,
      string
    ][] = [ms, us, [randomizer.get(), randomizer.name]];
    const allpass = select2(gws, "allpass", [undefined, "default"]);
    const volumegV = gvc?.maxVolume ?? 0;
    const volumemu = select2<
      RandomizerReturnType | LayeredVoiceConfig,
      "volume",
      number
    >(gws, "volume", [0, "default"]);
    let volumeV: number;
    let volumeP: string;
    const readName = gvc?.readName
      ? readName2(mss?.readName, uss?.readName, nickName, userName)
      : { value: undefined, provider: "server" };
    if (volumegV < volumemu.value) {
      volumeV = volumegV;
      volumeP = "server";
    } else {
      volumeV = volumemu.value;
      volumeP = volumemu.provider;
    }
    return {
      dictionary: {
        value: await this.dictionary(guild),
        provider: "default",
      },
      kind: select2(gws, "kind"),
      readName,
      speed: select2(gws, "speed"),
      tone: select2(gws, "tone"),
      volume: { value: volumeV, provider: volumeP },
      maxReadLimit:
        gvc?.maxReadLimit != null
          ? {
              value: gvc.maxReadLimit,
              provider: "server",
            }
          : {
              value: 130,
              provider: "default",
            },
      allpass: allpass,
      intone: select2(gws, "intone"),
      threshold: select2(gws, "threshold"),
    };
  }
  async getUserReadName(
    guild: string,
    user: string,
    nickName: string | undefined,
    userName: string
  ): Promise<string> {
    return readName(
      (await this.memberVoiceConfig.get([guild, user]))?.readName,
      (await this.userVoiceConfig.get(user))?.readName,
      nickName,
      userName
    );
  }
  dictionary(guild: string): Promise<Domain.Dictionary> {
    return this.dictionaryRepo.getAll(guild);
  }
}
