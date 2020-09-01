import { CommandStore, KlasaMessage } from "klasa";
import { CommandEx } from "presentation_klasa-core-command-rewrite";
import { DictionaryRepository, DictionaryEntryB } from "domain_voice-configs";
import { autoInjectable, inject } from "tsyringe";
import * as LANG_KEYS from "../../../lang_keys";
import { CtxBase, PaginationGui } from "../../../gui/pagination";
type SimpleDictEntry = {
  from: string;
  to: string;
};
type PageValue = DictionaryEntryB & { index: number };

@autoInjectable()
export default class extends CommandEx {
  constructor(
    store: CommandStore,
    file: string[],
    directory: string,
    @inject("DictionaryRepository")
    private readonly dictionary: DictionaryRepository,
    @inject("AfterDictionaryGui")
    private readonly gui: PaginationGui<CtxBase<PageValue>>
  ) {
    super(store, file, directory, {
      subcommands: true,
    });
    this.createCustomResolver("simple-dict-entry", (arg, possible, message) => {
      const arr = arg.split(",");
      if (arr.length != 2) {
        throw message.language.get(LANG_KEYS.INVALID_SIMPLE_DICT_ENTRY);
      }
      const [from, to] = arr;
      return { from, to };
    });
  }
  async run(
    msg: KlasaMessage,
    [sub, ...args]: [
      "add" | "remove" | "update" | "list",
      number | SimpleDictEntry | undefined,
      SimpleDictEntry | string | undefined
    ]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    return await this[sub](msg, args);
  }
  async add(
    msg: KlasaMessage,
    [arg1, arg2]: [
      number | SimpleDictEntry | undefined,
      SimpleDictEntry | string | undefined
    ]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    if (arg1 === undefined) {
      return msg.sendLocale(LANG_KEYS.INVALID_ADD_FORMAT);
    }
    if (typeof arg2 === "string") {
      return msg.sendLocale(LANG_KEYS.INVALID_ADD_FORMAT);
    }
    const append = () => {
      if (typeof arg1 === "number") {
        if (!arg2) {
          return msg.sendLocale(LANG_KEYS.INVALID_ADD_FORMAT);
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.dictionary.appendAfter(msg.guild!.id, arg2, arg1 - 1);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.dictionary.appendAfter(msg.guild!.id, arg1);
      }
    };
    const r = await append();
    if (r instanceof KlasaMessage) {
      return r;
    }
    return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS_WITH_CREATE, [
      r.from,
      r.to,
    ]);
  }
  async remove(
    msg: KlasaMessage,
    [arg1, arg2]: [
      number | SimpleDictEntry | undefined,
      SimpleDictEntry | string | undefined
    ]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    if (arg1 === undefined) {
      return msg.sendLocale(LANG_KEYS.INVALID_ADD_FORMAT);
    }
    if (typeof arg1 !== "number") {
      return msg.sendLocale(LANG_KEYS.INVALID_REMOVE_FORMAT);
    }
    if (arg2 !== undefined) {
      return msg.sendLocale(LANG_KEYS.INVALID_REMOVE_FORMAT);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.dictionary.removeAfter(msg.guild!.id, arg1 - 1);
    if (r) {
      return msg.sendLocale(LANG_KEYS.COMMAND_DELETE_WORD_SUCCESS_WITH_DELETE, [
        r.from,
        r.to,
      ]);
    } else {
      return msg.sendLocale(LANG_KEYS.INVALID_INDEX_RANGE);
    }
  }
  async update(
    msg: KlasaMessage,
    [arg1, arg2]: [
      number | SimpleDictEntry | undefined,
      SimpleDictEntry | string | undefined
    ]
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    if (arg1 === undefined) {
      return msg.sendLocale(LANG_KEYS.INVALID_ADD_FORMAT);
    }
    if (typeof arg1 !== "number") {
      return msg.sendLocale(LANG_KEYS.INVALID_UPDATE_FORMAT);
    }
    arg2 = arg2 ?? "";
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.dictionary.updateAfter(msg.guild!.id, arg1 - 1, arg2);
    if (r === undefined) {
      return msg.sendLocale(LANG_KEYS.INVALID_INDEX_RANGE);
    } else {
      return msg.sendLocale(LANG_KEYS.COMMAND_ADD_WORD_SUCCESS_WITH_OVERWRITE, [
        r[0],
        r[1],
      ]);
    }
  }
  async list(
    message: KlasaMessage
  ): Promise<KlasaMessage | KlasaMessage[] | null> {
    const split = (array: PageValue[], n: number) =>
      array.reduce(
        (a: PageValue[][], c: PageValue, i: number): PageValue[][] =>
          i % n == 0
            ? [...a, [c]]
            : [...a.slice(0, -1), [...a[a.length - 1], c]],
        [] as PageValue[][]
      );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p = await this.dictionary.getAfter(message.guild!.id);

    this.gui.emit("Init", {
      message,
      context: {
        authorId: message.author.id,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        member: message.member!,
        currentPage: 0,
        help: false,
        pages: split(
          p.map((e, i) => ({ ...e, index: i })),
          10
        ),
        timestamp: Date.now(),
      },
    });
    return Promise.resolve(null);
  }
}
