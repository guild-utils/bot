import {
  CtxBase,
  Options,
  createPagination,
  PaginationGui,
} from "../gui/pagination";
import { DictionaryEntryA, DictionaryEntryB } from "domain_voice-configs";
import { ColorResolvable, GuildMember, MessageEmbed } from "discord.js";
import { DependencyContainer } from "tsyringe";
import { getLangType } from "presentation_core";
type PageValueM = DictionaryEntryA & { from: string };
type PageValueBA = DictionaryEntryB & { index: number };
type CtxType = { member: GuildMember; timestamp: number | Date | undefined };
type OptType = { color: ColorResolvable; title: (lang: string) => string };
function setMetaData(
  embed: MessageEmbed,
  lang: string,
  subtitle: string,
  context: CtxType,
  options: OptType
) {
  embed.setTitle(`${options.title(lang)} (${subtitle})`);
  embed.setFooter(
    context.member.displayName,
    context.member.user.displayAvatarURL()
  );
  embed.setTimestamp(context.timestamp);
  embed.setColor(options.color);
}
function commonConf(texts: (lang: string) => GuiTexts) {
  return {
    color: 0xffd700,
    timeoutMs: 60 * 1000,
    help: (lang: string, context: CtxType, options: OptType) => {
      const embed = new MessageEmbed();
      setMetaData(embed, lang, `Help`, context, options);
      embed.setDescription(texts(lang).help);
      return embed;
    },
  };
}

export type GuiTexts = { empty: string; help: string };
export function initMainDictionaryGui(
  container: DependencyContainer,
  texts: (lang: string) => GuiTexts,
  getLang: getLangType
): PaginationGui<CtxBase<PageValueM>> {
  function buildEmbed(
    lang: string,
    no: number,
    context: CtxBase<PageValueM>,
    options: Options<CtxBase<PageValueM>>
  ) {
    if (context.pages.length === 0) {
      const embed = new MessageEmbed();
      embed.setDescription(texts(lang).empty);
      setMetaData(embed, lang, "0/0", context, options);
      return embed;
    }
    const page = context.pages[no];
    if (!page) {
      return;
    }
    context.currentPage = no;
    const embed = new MessageEmbed();
    function buildValue(e: DictionaryEntryA) {
      const arr: string[] = [];
      if (e.p) {
        arr.push(e.p);
      }
      if (e.p1) {
        arr.push(e.p1);
      }
      if (e.p2) {
        arr.push(e.p2);
      }
      if (e.p3) {
        arr.push(e.p3);
      }
      return arr.length ? `(${arr.join(",")})` : "";
    }
    setMetaData(
      embed,
      lang,
      `${no + 1}/${context.pages.length}`,
      context,
      options
    );
    embed.addFields(
      page.map((e) => {
        return {
          name: e.from,
          value: buildValue(e) + "\n" + e.to + "\n",
        };
      })
    );
    return embed;
  }
  const mainDictionaryGui = createPagination({
    title: () => "メイン辞書",
    buildEmbed,
    ...commonConf(texts),
    getLang,
  });
  container.register("MainDictionaryGui", {
    useValue: mainDictionaryGui,
  });
  return mainDictionaryGui;
}
export function initBADictionaryGui(
  container: DependencyContainer,
  texts: (lang: string) => GuiTexts,
  getLang: getLangType
): [PaginationGui<CtxBase<PageValueBA>>, PaginationGui<CtxBase<PageValueBA>>] {
  function buildEmbed(
    lang: string,
    no: number,
    context: CtxBase<PageValueBA>,
    options: Options<CtxBase<PageValueBA>>
  ) {
    if (context.pages.length === 0) {
      const embed = new MessageEmbed();
      embed.setDescription(texts(lang).empty);
      setMetaData(embed, lang, "0/0", context, options);
      return embed;
    }
    const page = context.pages[no];
    if (!page) {
      return;
    }
    context.currentPage = no;
    const embed = new MessageEmbed();
    setMetaData(
      embed,
      lang,
      `${no + 1}/${context.pages.length}`,
      context,
      options
    );
    embed.addFields(
      page.map((e) => {
        return {
          name: `[${e.index + 1}]${e.from}`,
          value: e.to.trim().length === 0 ? `""` : e.to,
        };
      })
    );
    return embed;
  }
  const beforeDictionaryGui = createPagination({
    title: () => "前辞書",
    buildEmbed,
    ...commonConf(texts),
    getLang,
  });
  container.register("BeforeDictionaryGui", {
    useValue: beforeDictionaryGui,
  });
  const afterDictionaryGui = createPagination({
    title: () => "後辞書",
    buildEmbed,
    ...commonConf(texts),
    getLang,
  });
  container.register("AfterDictionaryGui", {
    useValue: afterDictionaryGui,
  });
  return [beforeDictionaryGui, afterDictionaryGui];
}
