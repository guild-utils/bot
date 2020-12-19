import { EmbedFieldData, MessageEmbed } from "discord.js";
import {
  Documentation,
  DeepEntry,
  HelpCommandCotext,
} from "../../commands/info/help";
class KeysDocumentionRoot implements Documentation {
  type: "documentation" = "documentation";
  constructor(
    private readonly keyinfoVisible: Map<
      string,
      (lang: string) => (ctx: HelpCommandCotext) => string
    >,
    private readonly baseEmbedSupplier: (
      lang: string
    ) => (ctx: HelpCommandCotext) => MessageEmbed
  ) {}
  embed(lang: string): (ctx: HelpCommandCotext) => MessageEmbed {
    return (ctx) => {
      const fileds = [...this.keyinfoVisible].map(
        ([k, v]): EmbedFieldData => {
          return {
            name: k,
            value: v(lang)(ctx),
          };
        }
      );
      return this.baseEmbedSupplier(lang)(ctx).addFields(fileds);
    };
  }
  summary(lang: string): (ctx: HelpCommandCotext) => string {
    throw new TypeError("never call");
  }
}
class KeysDocumentationLeaf implements Documentation {
  constructor(
    public readonly embed: (
      lang: string
    ) => (ctx: HelpCommandCotext) => MessageEmbed
  ) {}
  type: "documentation" = "documentation";
  summary(lang: string): (ctx: HelpCommandCotext) => string {
    throw new TypeError("never call");
  }
}
export class KeysDeepEntry implements DeepEntry {
  constructor(
    private readonly keyinfoVisible: Map<
      string,
      (lang: string) => (ctx: HelpCommandCotext) => string
    >,
    private readonly keyInfoResolvable: Map<
      string,
      (lang: string) => (ctx: HelpCommandCotext) => MessageEmbed
    >,
    private readonly baseEmbedSupplier: (
      lang: string
    ) => (ctx: HelpCommandCotext) => MessageEmbed,
    private readonly defaultPrefix: string
  ) {}
  type: "deep" = "deep";
  visual: "documentation" = "documentation";
  more(key?: string | undefined): Documentation | undefined {
    if (key == null) {
      return new KeysDocumentionRoot(
        this.keyinfoVisible,
        this.baseEmbedSupplier
      );
    }
    const embed = this.keyInfoResolvable.get(key);
    if (!embed) {
      return undefined;
    }
    return new KeysDocumentationLeaf(embed);
  }
  summary(lang: string): (ctx: HelpCommandCotext) => string {
    return (ctx) => {
      return `設定項目についての詳細についてのドキュメントです。\n${
        ctx.prefix ?? this.defaultPrefix
      }${ctx.runningCommand[0]} keysで確認する事ができます。`;
    };
  }
}
export type KeyInfoRecord<T extends string = string> = Record<
  T,
  {
    summary: (lang: string) => (ctx: HelpCommandCotext) => string;
    embed: (lang: string) => (ctx: HelpCommandCotext) => MessageEmbed;
    aliases?: string[];
  }
>;
export function keyInfoMap(
  s: KeyInfoRecord
): [
  Map<string, (lang: string) => (ctx: HelpCommandCotext) => string>,
  Map<string, (lang: string) => (ctx: HelpCommandCotext) => MessageEmbed>
] {
  const a = new Map<
    string,
    (lang: string) => (ctx: HelpCommandCotext) => string
  >();
  const b = new Map<
    string,
    (lang: string) => (ctx: HelpCommandCotext) => MessageEmbed
  >();
  for (const [k, v] of Object.entries(s)) {
    a.set(k + (v.aliases ? `(${v.aliases.join(",")})` : ""), v.summary);
    b.set(k, v.embed);
    for (const kk of v.aliases ?? []) {
      b.set(kk, v.embed);
    }
  }
  return [a, b];
}
