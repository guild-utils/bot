import { DictionaryEntryB, DictionaryRepository } from "domain_voice-configs";
import { PaginationGui, CtxBase } from "../gui/pagination";
import { CommandBase, CommandContext } from "@guild-utils/command-base";
import { Message, MessageEmbed } from "discord.js";
import { Executor, executorFromMessage } from "protocol_util-djs";
import { getLangType } from "presentation_core";

export type PageValue = DictionaryEntryB & { index: number };
export type SimpleDictionaryCommandResponses = {
  invalidAddFormat: (exec: Executor) => MessageEmbed;
  addSuccess: (exec: Executor, cur: DictionaryEntryB) => MessageEmbed;
  invalidRemoveFormat: (exec: Executor) => MessageEmbed;
  invalidIndexRange: (exec: Executor) => MessageEmbed;
  invalidUpdateFormat: (exec: Executor) => MessageEmbed;
  updateSuccess: (
    exec: Executor,
    before: DictionaryEntryB,
    after: DictionaryEntryB
  ) => MessageEmbed;
  deleteSuccess: (exec: Executor, deleted: DictionaryEntryB) => MessageEmbed;
};
export type SimpleDictionaryActions = {
  append: (
    guild: string,
    entry: DictionaryEntryB,
    pos?: number
  ) => Promise<DictionaryEntryB>;
  remove: (guild: string, key: number) => Promise<DictionaryEntryB | undefined>;
  update: (
    guild: string,
    key: number,
    entry: DictionaryEntryB | string
  ) => Promise<[DictionaryEntryB, DictionaryEntryB] | undefined>;
  get: (guild: string) => Promise<DictionaryEntryB[]>;
};
export class SimpleDictionaryCommand implements CommandBase {
  constructor(
    private readonly actions: SimpleDictionaryActions,
    private readonly gui: PaginationGui<CtxBase<PageValue>>,
    private readonly responses: (
      lang: string
    ) => SimpleDictionaryCommandResponses,
    private readonly getLang: getLangType
  ) {}
  async run(
    msg: Message,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any[],
    opt: never,
    ctx: CommandContext
  ): Promise<void> {
    const sub = ctx.runningCommand[1] as
      | "add"
      | "insert"
      | "remove"
      | "update"
      | "list"
      | undefined;
    if (sub == null) {
      return await this.list(msg);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this[sub](msg, args as any);
  }
  async insert(
    msg: Message,
    [arg1, arg2]: [number, DictionaryEntryB]
  ): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (arg1 === undefined) {
      await msg.sendEmbed(res.invalidAddFormat(exec));
      return;
    }
    if (typeof arg2 === "string") {
      await msg.sendEmbed(res.invalidAddFormat(exec));
      return;
    }

    const append = () => {
      if (typeof arg1 === "number") {
        if (!arg2) {
          return msg.sendEmbed(res.invalidAddFormat(exec));
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.actions.append(msg.guild!.id, arg2, arg1 - 1);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.actions.append(msg.guild!.id, arg1);
      }
    };
    const r = await append();
    if (r instanceof Message) {
      return;
    }
    await msg.sendEmbed(res.addSuccess(exec, r));
  }
  async add(msg: Message, [arg2]: [DictionaryEntryB]): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (typeof arg2 === "string") {
      await msg.sendEmbed(res.invalidAddFormat(exec));
      return;
    }

    const append = () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.actions.append(msg.guild!.id, arg2);
    };
    const r = await append();
    if (r instanceof Message) {
      return;
    }
    await msg.sendEmbed(res.addSuccess(exec, r));
  }
  async remove(msg: Message, [arg1]: [number]): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (arg1 === undefined) {
      await msg.sendEmbed(res.invalidRemoveFormat(exec));
      return;
    }
    if (typeof arg1 !== "number") {
      await msg.sendEmbed(res.invalidRemoveFormat(exec));
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.actions.remove(msg.guild!.id, arg1 - 1);
    if (r) {
      await msg.sendEmbed(res.deleteSuccess(exec, r));
      return;
    } else {
      await msg.sendEmbed(res.invalidIndexRange(exec));
      return;
    }
  }
  async update(
    msg: Message,
    [arg1, arg2]: [number, string | DictionaryEntryB]
  ): Promise<void> {
    const res = this.responses(await this.getLang(msg.guild?.id));
    const exec = executorFromMessage(msg);
    if (arg1 === undefined) {
      await msg.sendEmbed(res.invalidUpdateFormat(exec));
      return;
    }
    if (typeof arg1 !== "number") {
      await msg.sendEmbed(res.invalidUpdateFormat(exec));
      return;
    }
    arg2 = arg2 ?? "";
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const r = await this.actions.update(msg.guild!.id, arg1 - 1, arg2);
    if (r === undefined) {
      await msg.sendEmbed(res.invalidIndexRange(exec));
      return;
    } else {
      await msg.sendEmbed(res.updateSuccess(exec, r[0], r[1]));
      return;
    }
  }
  async list(message: Message): Promise<void> {
    const split = (array: PageValue[], n: number) =>
      array.reduce(
        (a: PageValue[][], c: PageValue, i: number): PageValue[][] =>
          i % n == 0
            ? [...a, [c]]
            : [...a.slice(0, -1), [...a[a.length - 1], c]],
        [] as PageValue[][]
      );
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const p = await this.actions.get(message.guild!.id);
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
  }
}

export function commandBeforeDictionary(
  repo: DictionaryRepository,
  gui: PaginationGui<CtxBase<PageValue>>,
  responses: (lang: string) => SimpleDictionaryCommandResponses,
  getLang: getLangType
): SimpleDictionaryCommand {
  return new SimpleDictionaryCommand(
    {
      append: repo.appendBefore.bind(repo),
      get: repo.getBefore.bind(repo),
      remove: repo.removeBefore.bind(repo),
      update: repo.updateBefore.bind(repo),
    },
    gui,
    responses,
    getLang
  );
}
export function commandAfterDictionary(
  repo: DictionaryRepository,
  gui: PaginationGui<CtxBase<PageValue>>,
  responses: (lang: string) => SimpleDictionaryCommandResponses,
  getLang: getLangType
): SimpleDictionaryCommand {
  return new SimpleDictionaryCommand(
    {
      append: repo.appendAfter.bind(repo),
      get: repo.getAfter.bind(repo),
      remove: repo.removeAfter.bind(repo),
      update: repo.updateAfter.bind(repo),
    },
    gui,
    responses,
    getLang
  );
}
