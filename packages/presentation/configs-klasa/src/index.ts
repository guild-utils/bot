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
export class Usecase implements Domain.Usecase {
  constructor(
    private readonly gateways: GatewayDriver,
    private readonly dictionaryRepo: DictionaryRepository
  ) {}

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
  dictionary(guild: string | Settings): Promise<Domain.Dictionary> {
    return this.dictionaryRepo.getAll(guild);
  }
}
type PromiseReturnType<X> = X extends Promise<infer T> ? T : X;
async function allProperty<T>(
  obj: { [k in keyof T]: Promise<any> | any }
): Promise<{ [k in keyof T]: PromiseReturnType<typeof obj[k]> }> {
  const r = {};
  const promises: Promise<[string, any]>[] = [];
  for (const [k, v] of Object.entries(obj)) {
    promises.push((async (): Promise<[string, any]> => [k, await v])());
  }
  const resolved = await Promise.all(promises);
  for (const [k, v] of resolved) {
    r[k] = v;
  }
  return r as { [k in keyof T]: PromiseReturnType<typeof obj[k]> };
}
export class DictionaryRepository implements Domain.DictionaryRepository {
  constructor(private readonly gateways: GatewayDriver) {}

  async getAll(guild: string | Settings): Promise<Domain.Dictionary> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
    return allProperty({
      after: this.getAfter(settings),
      before: this.getBefore(settings),
      main: this.getMain(settings),
    });
  }
  async getBefore(
    guild: string | Settings
  ): Promise<Domain.DictionaryEntryB[]> {
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
    return dictionaryB;
  }
  async getMain(
    guild: string | Settings
  ): Promise<Map<string, Domain.DictionaryEntryA>> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
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
    return dictionary;
  }
  async getAfter(guild: string | Settings): Promise<Domain.DictionaryEntryB[]> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
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
    return dictionaryA;
  }
  async removeBefore(
    guild: string | Settings,
    key: string
  ): Promise<string | undefined> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
    const arr: {
      k: string;
      v?: string;
    }[] = settings.get(GUILD_CONFIGS.text2speechDictionaryBefore);
    const index = arr.findIndex(
      ({ k }: { k: string; v?: string }) => toFullWidth(key) === k
    );
    if (index < 0) {
      return undefined;
    }
    await settings.update(GUILD_CONFIGS.text2speechDictionaryBefore.join("."), {
      action: "remove",
      arrayPosition: index,
    });
    return arr[index].v ?? "";
  }
  async removeMain(
    guild: string | Settings,
    key: string
  ): Promise<Domain.DictionaryEntryA | undefined> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
    const arr: {
      k: string;
      v?: string;
      p?: string;
      p1?: string;
      p2?: string;
      p3?: string;
    }[] = settings.get(GUILD_CONFIGS.text2speechDictionary);
    const index = arr.findIndex(
      ({
        k,
      }: {
        k: string;
        v?: string;
        p?: string;
        p1?: string;
        p2?: string;
        p3?: string;
      }) => toFullWidth(key) === k
    );
    if (index < 0) {
      return undefined;
    }
    await settings.update(GUILD_CONFIGS.text2speechDictionary.join("."), {
      action: "remove",
      arrayPosition: index,
    });
    const { v, p, p1, p2, p3 } = arr[index];
    return {
      to: v ?? "",
      p,
      p1,
      p2,
      p3,
    };
  }
  async removeAfter(
    guild: string | Settings,
    key: string
  ): Promise<string | undefined> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
    const arr: {
      k: string;
      v?: string;
    }[] = settings.get(GUILD_CONFIGS.text2speechDictionaryAfter);
    const index = arr.findIndex(
      ({ k }: { k: string; v?: string }) => toFullWidth(key) === k
    );
    if (index < 0) {
      return undefined;
    }
    await settings.update(GUILD_CONFIGS.text2speechDictionaryAfter.join("."), {
      action: "remove",
      arrayPosition: index,
    });
    return arr[index].v ?? "";
  }
  async removeAll(guild: string | Settings): Promise<void> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
    await Promise.all([
      settings.reset(GUILD_CONFIGS.text2speechDictionaryBefore.join(".")),
      settings.reset(GUILD_CONFIGS.text2speechDictionary.join(".")),
      settings.reset(GUILD_CONFIGS.text2speechDictionaryAfter.join(".")),
    ]);
  }
  async updateMain(
    guild: string | Settings,
    key: string,
    entry: Domain.DictionaryEntryA
  ): Promise<[Domain.DictionaryEntryA | undefined, Domain.DictionaryEntryA]> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
    const arr: {
      k: string;
      v?: string;
      p?: string;
      p1?: string;
      p2?: string;
      p3?: string;
    }[] = settings.get(GUILD_CONFIGS.text2speechDictionary);
    const word = toFullWidth(key);
    const index = arr.findIndex(
      ({ k }: { k: string; v?: string }) => word === k
    );
    const { to, p, p1, p2, p3 } = entry;
    if (index < 0) {
      await settings.update(
        GUILD_CONFIGS.text2speechDictionary.join("."),
        { k: toFullWidth(word), v: to, p, p1, p2, p3 },
        { action: "add" }
      );
      return [undefined, entry];
    }
    arr[index] = { k: toFullWidth(word), v: to, p, p1, p2, p3 };
    const old = settings.get(GUILD_CONFIGS.text2speechDictionary.join("."));
    await settings.update(GUILD_CONFIGS.text2speechDictionary.join("."), arr, {
      action: "overwrite",
    });
    return [old, entry];
  }
  async updateBefore(
    guild: string | Settings,
    key: string,
    to: string
  ): Promise<[string | undefined, string]> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
    const arr: {
      k: string;
      v?: string;
    }[] = settings.get(GUILD_CONFIGS.text2speechDictionaryBefore);
    const fword = toFullWidth(key);
    const index = arr.findIndex(
      ({ k }: { k: string; v?: string }) => fword === k
    );
    if (index < 0) {
      await settings.update(
        GUILD_CONFIGS.text2speechDictionaryBefore.join("."),
        { k: fword, v: to },
        { action: "add" }
      );
      return [undefined, to];
    }
    const old = arr[index].v;
    arr[index] = { k: fword, v: to };
    await settings.update(
      GUILD_CONFIGS.text2speechDictionaryBefore.join("."),
      arr,
      { action: "overwrite" }
    );
    return [old ?? "", to];
  }
  async updateAfter(
    guild: string | Settings,
    key: string,
    to: string
  ): Promise<[string | undefined, string]> {
    const settings =
      typeof guild === "string"
        ? await this.gateways.guilds.get(guild, true).sync()
        : guild;
    const arr: {
      k: string;
      v?: string;
    }[] = settings.get(GUILD_CONFIGS.text2speechDictionaryAfter);
    const fword = toFullWidth(key);
    const index = arr.findIndex(
      ({ k }: { k: string; v?: string }) => fword === k
    );
    if (index < 0) {
      await settings.update(
        GUILD_CONFIGS.text2speechDictionaryAfter.join("."),
        { k: fword, v: to },
        { action: "add" }
      );
      return [undefined, to];
    }
    const old = arr[index].v;
    arr[index] = { k: fword, v: to };
    await settings.update(
      GUILD_CONFIGS.text2speechDictionaryAfter.join("."),
      arr,
      { action: "overwrite" }
    );
    return [old ?? "", to];
  }
}

function toFullWidth(elm: string) {
  return elm.replace(/[A-Za-z0-9!-~]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
  });
}
