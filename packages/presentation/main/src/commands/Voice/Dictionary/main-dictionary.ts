import { CommandStore, KlasaMessage } from "klasa";
import { CommandEx } from "presentation_klasa-core-command-rewrite";
import { DictionaryRepository, DictionaryEntryA } from "domain_voice-configs";
import { autoInjectable, inject } from "tsyringe";
import * as LANG_KEYS from "../../../lang_keys";
import { PaginationGui, CtxBase } from "../../../gui/pagination";
type MainDictEntry = {
  to: string;
  p?: string;
  p1?: string;
  p2?: string;
  p3?: string;
};
type PageValue = DictionaryEntryA & { from: string };

@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("DictionaryRepository")
    private readonly dictionary: DictionaryRepository,
    @inject("MainDictionaryGui")
    private readonly gui: PaginationGui<CtxBase<PageValue>>
  ) {
    super(store, file, directory, {
      subcommands: true,
    });
    this.createCustomResolver(
      "main-dict-entry",
      (arg, possible, message): MainDictEntry => {
        const arr = arg.split(",");
        const len = arr.length;
        if (1 > len || 5 < len) {
          throw message.language.get(LANG_KEYS.INVALID_MAIN_DICT_ENTRY);
        }
        const [to, p, p1, p2, p3] = arr;
        return { to, p, p1, p2, p3 };
      }
    );
  }
  async run(
    msg: KlasaMessage,
    [sub, ...args]: [
      "add" | "remove" | "update" | "list",
      string,
      MainDictEntry?
    ]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    return await this[sub](msg, args);
  }
  async add(
    msg: KlasaMessage,
    args: [string?, MainDictEntry?]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    return this.update(msg, args);
  }
  async remove(
    msg: KlasaMessage,
    [arg1, arg2]: [string?, MainDictEntry?]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    if (!arg1) {
      return msg.sendLocale(LANG_KEYS.COMMAND_MAIN_DICT_REQUIRE_KEY);
    }
    if (arg2) {
      return msg.sendLocale(LANG_KEYS.COMMAND_MAIN_DICT_INVALID_REMOVE_FORMAT);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.dictionary.removeMain(msg.guild!.id, arg1);
    if (r) {
      return msg.sendLocale(LANG_KEYS.COMMAND_DELETE_WORD_SUCCESS_WITH_DELETE, [
        arg1,
        r.to,
      ]);
    } else {
      return msg.sendLocale(LANG_KEYS.COMMAND_DELETE_WORD_SUCCESS_WITH_NONE, [
        arg1,
      ]);
    }
  }
  async update(
    msg: KlasaMessage,
    [arg1, arg2]: [string?, MainDictEntry?]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    if (!arg1) {
      return msg.sendLocale(LANG_KEYS.COMMAND_MAIN_DICT_REQUIRE_KEY);
    }
    if (!arg2) {
      arg2 = { to: "" };
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.dictionary.updateMain(msg.guild!.id, arg1, arg2);
    if (!r[0]) {
      return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS_WITH_CREATE, [
        arg1,
        r[1].to,
      ]);
    } else {
      return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS_WITH_OVERWRITE, [
        { from: arg1, ...r[0] },
        { from: arg1, ...r[1] },
      ]);
    }
  }
  async list(
    message: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const split = (array: (DictionaryEntryA & { from: string })[], n: number) =>
      array.reduce(
        (
          a: (DictionaryEntryA & { from: string })[][],
          c: DictionaryEntryA & { from: string },
          i: number
        ): (DictionaryEntryA & { from: string })[][] =>
          i % n == 0
            ? [...a, [c]]
            : [...a.slice(0, -1), [...a[a.length - 1], c]],
        [] as (DictionaryEntryA & { from: string })[][]
      );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p = await this.dictionary.getMain(message.guild!.id);
    const u = [...p.entries()].map((e) => {
      return { from: e[0], ...e[1] };
    });
    this.gui.emit("Init", {
      message,
      context: {
        authorId: message.author.id,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        member: message.member!,
        currentPage: 0,
        help: false,
        pages: split(u, 10),
        timestamp: Date.now(),
      },
    });
    return Promise.resolve(null);
  }
}
