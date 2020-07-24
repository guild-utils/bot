/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as Domain from "domain_configs";
import { GatewayDriver } from "klasa";
import "klasa-member-gateway";
import { Settings } from "klasa";
import * as GUILD_CONFIGS from "presentation_shared-config/guild";
import * as MEMBER_CONFIGS from "presentation_shared-config/member";
function get(gws: Settings[], key: string[], defa?: any): any {
  for (const gw of gws) {
    const r = gw.get(key);
    if (r != undefined) {
      return r;
    }
  }
  if (arguments.length === 2) {
    throw new TypeError("Not Resolvable");
  }
  return defa;
}
function readName(
  ms: Settings,
  us: Settings,
  nickName: string | undefined,
  userName: string
): string {
  return (
    ms.get(MEMBER_CONFIGS.text2speechReadName) ??
    nickName ??
    us.get(MEMBER_CONFIGS.text2speechReadName) ??
    userName
  );
}
export default class Usecase implements Domain.Usecase {
  constructor(private readonly gateways: GatewayDriver) {}

  async appliedVoiceConfig(
    guild: string,
    user: string,
    nickName: string | undefined,
    userName: string
  ): Promise<Domain.AppliedVoiceConfig> {
    const gs = await this.gateways.guilds.get(guild, true).sync();
    const ms = await this.gateways.members.get([guild, user], true).sync();
    const us = await this.gateways.users.get(user, true).sync();
    const gws = [ms, us];
    const allpass = get(gws, MEMBER_CONFIGS.text2speechAllpass, undefined);
    return {
      dictionary: await this.dictionary(gs),
      kind: get(gws, MEMBER_CONFIGS.text2speechKind),
      readName: gs.get(GUILD_CONFIGS.text2speechReadName)
        ? readName(ms, us, nickName, userName)
        : undefined,
      speed: get(gws, MEMBER_CONFIGS.text2speechSpeed),
      tone: get(gws, MEMBER_CONFIGS.text2speechTone),
      volume: Math.min(
        gs.get(GUILD_CONFIGS.text2speechVolumeMax) ?? 0,
        get(gws, MEMBER_CONFIGS.text2speechVolume) ?? 0
      ),
      maxReadLimit: gs.get(GUILD_CONFIGS.text2speechMaxReadLimit),
      allpass: allpass,
      intone: get(gws, MEMBER_CONFIGS.text2speechIntone),
      threshold: get(gws, MEMBER_CONFIGS.text2speechThreshold),
    };
  }
  async getUserReadName(
    guild: string,
    user: string,
    nickName: string | undefined,
    userName: string
  ): Promise<string> {
    const gs = await this.gateways.guilds.get(guild, true).sync();
    const ms = await this.gateways.members.get([guild, user], true).sync();
    return readName(gs, ms, nickName, userName);
  }
  async dictionary(guild: string | Settings): Promise<Domain.Dictionary> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dictionaryBRaw: { k: string; v?: string }[] = settings.get(
      GUILD_CONFIGS.text2speechDictionaryBefore
    );
    const dictionaryB = dictionaryBRaw.map((obj: { k: string; v?: string }) => {
      return {
        from: obj.k,
        to: obj.v ?? "",
      };
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dictionaryArr = settings.get(GUILD_CONFIGS.text2speechDictionary);
    const dictionary = new Map<
      string,
      {
        to: string;
        p: string;
        p1: string;
        p2: string;
        p3: string;
      }
    >();
    for (const entry of dictionaryArr) {
      dictionary.set(entry.k, {
        to: entry.v ?? "",
        p: entry.p ?? "",
        p1: entry.p1 ?? "",
        p2: entry.p2 ?? "",
        p3: entry.p3 ?? "",
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dictionaryARaw: { k: string; v?: string }[] = settings.get(
      GUILD_CONFIGS.text2speechDictionaryAfter
    );
    const dictionaryA = dictionaryARaw.map((obj: { k: string; v?: string }) => {
      return {
        from: obj.k,
        to: obj.v ?? "",
      };
    });
    return { after: dictionaryA, before: dictionaryB, entrys: dictionary };
  }
}
