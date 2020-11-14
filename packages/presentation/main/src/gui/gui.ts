import { GuiBase as Base, GuiBaseConstructor, ActionType } from "discordjs-gui";
import {
  MessageMixin,
  MessageEventMixinMap,
  mixinMessage,
} from "discordjs-gui/mixins/message";
import {
  ReactionMixin,
  ReactionEventMixinMap,
  mixinReaction,
} from "discordjs-gui/mixins/reaction";
import { TimeoutMixin, mixinTimeout } from "discordjs-gui/mixins/timeout";
import {
  createMessageFilter,
  createReactionFilter,
  filterMessage,
  filterReaction,
  MessageFilterController,
  ReactionFilterController,
} from "discordjs-gui/plugins/filter";
import {
  createMessageContext,
  MessageContextController,
} from "discordjs-gui/plugins/store";
import { createTimeoutScheduler } from "discordjs-gui/plugins/timeout";
import { Message, EmojiResolvable, MessageReaction } from "discord.js";
import { GuiControllerMixin } from "./common";
export type Except<ObjectType, KeysType extends keyof ObjectType> = Pick<
  ObjectType,
  Exclude<keyof ObjectType, KeysType>
>;
export type Merge<FirstType, SecondType> = Except<
  FirstType,
  Extract<keyof FirstType, keyof SecondType>
> &
  SecondType;
const MessageCheck = Symbol("MessageCheck"); //DO NOT EXPORT
const CheckOk = Symbol("CheckOk"); //DO NOT EXPORT
export type GuiEventMap<Ctx> = MessageEventMixinMap &
  ReactionEventMixinMap & {
    Timeout: {
      target: Message;
    };
    Schedule: {
      target: Message;
    };
    Next: {
      target: Message;
      context: Ctx;
    };
    Prev: {
      target: Message;
      context: Ctx;
    };
    Head: {
      target: Message;
      context: Ctx;
    };
    Last: {
      target: Message;
      context: Ctx;
    };
    Page: {
      target: Message;
      context: Ctx;
      no: number;
    };
    Help: {
      target: Message;
      context: Ctx;
    };
    Exit: {
      target: Message;
      context: Ctx;
    };
    Content: {
      content: string;
      target: Message;
      context: Ctx;
    };
  };
type Internal<Ctx> = GuiEventMap<Ctx> & {
  [MessageCheck]: {
    message: Message;
    checking: [Message, Ctx][];
  };
  [CheckOk]: {
    message: Message;
    target: Message;
    context: Ctx;
  };
};
export interface GuiBase<Evm extends GuiEventMap<Ctx>, Ctx>
  extends Base<Evm>,
    MessageMixin<Evm>,
    ReactionMixin<Evm>,
    TimeoutMixin<Evm>,
    GuiControllerMixin<Ctx> {}
export type CtxBase = {
  authorId: string;
};

export type Contexts<Ctx> = {
  contexts: MessageContextController<Ctx>;
  messageFilter: MessageFilterController;
  reactionFilter: ReactionFilterController;
};
export function createContexts<Ctx>(): Contexts<Ctx> {
  const contexts = createMessageContext<Ctx>();
  const messageFilter = createMessageFilter();
  const reactionFilter = createReactionFilter();
  return { contexts, messageFilter, reactionFilter };
}
export function addEmojiSerial(
  message: Message,
  emojis: EmojiResolvable[]
): AsyncGenerator<MessageReaction, void> {
  async function* run() {
    for (const emoji of emojis) {
      yield await message.react(emoji);
    }
  }
  return run();
}
export function mixinAll<Evm extends GuiEventMap<Ctx>, Ctx>({
  contexts,
  messageFilter,
  reactionFilter,
}: Contexts<Ctx>): GuiBaseConstructor<GuiBase<Evm, Ctx>, Evm> {
  let Pagination = Base;
  Pagination = mixinMessage(Pagination);
  Pagination = mixinReaction(Pagination);
  Pagination = mixinTimeout(Pagination);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Pagination = class extends Pagination<any> {
    register(message: Message, ctx: Ctx) {
      contexts.register(message, ctx);
      messageFilter.watch(message);
      reactionFilter.watch(message);
    }
    unregister(message: Message) {
      contexts.unregister(message);
      messageFilter.unwatch(message);
      reactionFilter.unwatch(message);
    }
  } as typeof Base;
  return Pagination as GuiBaseConstructor<GuiBase<Evm, Ctx>, Evm>;
}
export type Options<Ctx> = {
  timeoutMs: number;
  ctxs: Contexts<Ctx>;
};
export function initializeGui<
  Evm extends GuiEventMap<Ctx>,
  Ctx extends CtxBase
>(source: GuiBase<Evm, Ctx>, options: Options<Ctx>): void {
  const gui = (source as unknown) as GuiBase<Internal<Ctx>, Ctx>;

  function contentRouter<
    K extends "Next" | "Prev" | "Head" | "Last" | "Help" | "Exit"
  >(k: K, signs: string[]) {
    return (
      { content, context, target }: Internal<Ctx>["Content"],
      { emit, next }: ActionType<Internal<Ctx>>
    ) => {
      if (signs.some((e) => content.startsWith(e))) {
        emit("Schedule", { target });
        emit(k, { context, target });
      }
      next();
    };
  }
  const { contexts, messageFilter, reactionFilter } = options.ctxs;
  type TimeoutCtx = {
    target: Message;
  };
  const timeoutScheduler = createTimeoutScheduler<TimeoutCtx>((id, ctx) =>
    gui.emit("Timeout", { target: ctx.target })
  );
  gui.use(
    "Message",
    filterMessage(messageFilter, (ev, messageIds, { emit }) => {
      const messagesCache = ev.message.channel.messages.cache;
      const checkingMsg = messageIds
        .map((id) => messagesCache.get(id))
        .filter((e): e is Message => !!e);
      const checking = checkingMsg.flatMap((e): [Message, Ctx][] => {
        const ctx = contexts.contexts.get(e.id);
        if (!ctx) {
          return [];
        }
        return [[e, ctx]];
      });
      emit(MessageCheck, {
        message: ev.message,
        checking,
      });
    })
  );
  gui.use(MessageCheck, (ev, { next }) => {
    ev.checking = ev.checking.filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_target, ctx]) => ctx.authorId === ev.message.author.id
    );
    next();
  });
  gui.use(MessageCheck, (ev, { next }) => {
    ev.checking.sort((a, b) => a[0].createdTimestamp - b[0].createdTimestamp);
    next();
  });
  gui.use(MessageCheck, (ev, { emit }) => {
    if (ev.checking[0]) {
      emit(CheckOk, {
        message: ev.message,
        target: ev.checking[0][0],
        context: ev.checking[0][1],
      });
    }
  });
  gui.use(CheckOk, (ev, { emit }) => {
    emit("Content", {
      content: ev.message.cleanContent,
      target: ev.target,
      context: ev.context,
    });
  });
  gui.use("Reaction", filterReaction(reactionFilter));
  gui.use("Reaction", (ev, { emit }) => {
    const context = contexts.contexts.get(ev.reaction.message.id);
    if (!context) {
      return;
    }
    if (context.authorId !== ev.user.id) {
      return;
    }
    emit("Content", {
      target: ev.reaction.message,
      content: ev.reaction.emoji.name,
      context,
    });
  });
  gui.use("Content", ({ content, context, target }, { emit, next }) => {
    function filterInt(value: string) {
      if (/^[-+]?(\d+|Infinity)$/.test(value)) {
        return Number(value);
      } else {
        return NaN;
      }
    }
    const no = filterInt(content);
    if (!Number.isNaN(no)) {
      emit("Schedule", { target });
      emit("Page", { context, no: no - 1, target });
      return;
    }
    next();
  });
  gui.use(
    "Content",
    contentRouter("Head", ["f", "first", "head", "<<", "\u23ea"])
  );
  gui.use("Content", contentRouter("Last", ["l", "last", ">>", "\u23e9"]));
  gui.use(
    "Content",
    contentRouter("Next", ["n", "next", ">", "\u25b6", "\u27a1"])
  );
  gui.use(
    "Content",
    contentRouter("Prev", ["b", "p", "back", "prev", "<", "\u25c0", "\u2b05"])
  );
  gui.use(
    "Content",
    contentRouter("Help", ["help", "h", "?", "\u2139", "\u2753", "\u2754"])
  );
  gui.use(
    "Content",
    contentRouter("Exit", [
      "q",
      "end",
      "halt",
      "quit",
      "exit",
      "close",
      "stop",
      "\u23f9",
      "\u274c",
    ])
  );
  gui.use("Schedule", ({ target }) => {
    timeoutScheduler.schedule(target.id, { target }, options.timeoutMs);
  });
}
export async function serealAddReaction(
  message: Message,
  reactions: EmojiResolvable[],
  signal?: AbortSignal
): Promise<void> {
  for (const reaction of reactions) {
    if (signal?.aborted) {
      return;
    }
    await message.react(reaction);
  }
}
