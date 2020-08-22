import {
  CtxBase,
  Options,
  createPagination,
  PaginationGui,
} from "../gui/pagination";
import { DictionaryEntryA, DictionaryEntryB } from "domain_configs";
import { MessageEmbed } from "discord.js";
import { DependencyContainer } from "tsyringe";
type PageValueM = DictionaryEntryA & { from: string };
type PageValueBA = DictionaryEntryB & { index: number };
function setMetaData<Page>(
  embed: MessageEmbed,
  subtitle: string,
  context: CtxBase<Page>,
  options: Options<CtxBase<Page>>
) {
  embed.setTitle(`${options.title} (${subtitle})`);
  embed.setFooter(
    context.member.displayName,
    context.member.user.displayAvatarURL()
  );
  embed.setTimestamp(context.timestamp);
  embed.setColor(options.color);
}
export function initMainDictionaryGui(
  container: DependencyContainer,
  { emptyMessage }: { emptyMessage: string }
): PaginationGui<CtxBase<PageValueM>> {
  function buildEmbed(
    no: number,
    context: CtxBase<PageValueM>,
    options: Options<CtxBase<PageValueM>>
  ) {
    if (context.pages.length === 0) {
      const embed = new MessageEmbed();
      embed.setDescription(emptyMessage);
      setMetaData(embed, "0/0", context, options);
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
    setMetaData(embed, `${no + 1}/${context.pages.length}`, context, options);
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
    title: "メイン辞書",
    color: 0xffd700,
    timeoutMs: 60 * 1000,
    buildEmbed,
    help: (context, options) => {
      const embed = new MessageEmbed();
      setMetaData(embed, `Help`, context, options);
      return embed;
    },
  });
  container.register("MainDictionaryGui", {
    useValue: mainDictionaryGui,
  });
  return mainDictionaryGui;
}
export function initBADictionaryGui(
  container: DependencyContainer,
  { emptyMessage }: { emptyMessage: string }
): [PaginationGui<CtxBase<PageValueBA>>, PaginationGui<CtxBase<PageValueBA>>] {
  function buildEmbed(
    no: number,
    context: CtxBase<PageValueBA>,
    options: Options<CtxBase<PageValueBA>>
  ) {
    if (context.pages.length === 0) {
      const embed = new MessageEmbed();
      embed.setDescription(emptyMessage);
      setMetaData(embed, "0/0", context, options);
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
    setMetaData(embed, `${no + 1}/${context.pages.length}`, context, options);
    embed.addFields(
      page.map((e) => {
        return {
          name: `[${e.index + 1}]${e.from}`,
          value: buildValue(e) + "\n" + e.to + "\n",
        };
      })
    );
    return embed;
  }
  const beforeDictionaryGui = createPagination({
    title: "前辞書",
    color: 0xffd700,
    timeoutMs: 60 * 1000,
    buildEmbed,
    help: (context, options) => {
      const embed = new MessageEmbed();
      setMetaData(embed, `Help`, context, options);
      return embed;
    },
  });
  container.register("BeforeDictionaryGui", {
    useValue: beforeDictionaryGui,
  });
  const afterDictionaryGui = createPagination({
    title: "後辞書",
    color: 0xffd700,
    timeoutMs: 60 * 1000,
    buildEmbed,
    help: (context, options) => {
      const embed = new MessageEmbed();
      setMetaData(embed, `Help`, context, options);
      return embed;
    },
  });
  container.register("AfterDictionaryGui", {
    useValue: afterDictionaryGui,
  });
  return [beforeDictionaryGui, afterDictionaryGui];
}
