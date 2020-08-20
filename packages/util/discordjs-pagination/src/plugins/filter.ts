import { Message } from "discord.js";
import { ReactionHandler, ReactionEventMixinMap } from "../mixins/reaction";
import {
  MessageEvent,
  MessageHandler,
  MessageEventMixinMap,
} from "../mixins/message";
import { ActionType } from "../base";
export type MessageFilterController = {
  watchingMessageIdWithChannelId: Map<string, Set<string>>;
  unwatch: (message: Message) => void;
  watch: (message: Message) => void;
};
export function createMessageFilter(): MessageFilterController {
  const watchingMessageIdWithChannelId: Map<string, Set<string>> = new Map<
    string,
    Set<string>
  >();
  const controller = {
    watchingMessageIdWithChannelId: watchingMessageIdWithChannelId,
    unwatch: (message: Message) => {
      const messageIds = watchingMessageIdWithChannelId.get(message.channel.id);
      if (!messageIds?.delete(message.id)) {
        return;
      }
      if (messageIds.size) {
        return;
      }
      watchingMessageIdWithChannelId.delete(message.channel.id);
    },
    watch: (message: Message) => {
      let v = watchingMessageIdWithChannelId.get(message.channel.id);
      if (!v) {
        v = new Set();
        watchingMessageIdWithChannelId.set(message.channel.id, v);
        return;
      }
      v.add(message.id);
      return;
    },
  };
  return controller;
}
export function filterMessage<EventMap extends MessageEventMixinMap>(
  controller: MessageFilterController,
  matchFunc?: (
    ev: MessageEvent,
    messageIds: string[],
    action: ActionType<EventMap>
  ) => void
): MessageHandler<EventMap> {
  return (ev, action) => {
    if (controller.watchingMessageIdWithChannelId.has(ev.message.channel.id)) {
      action.next();
      if (matchFunc) {
        const messageIds = [
          ...(controller.watchingMessageIdWithChannelId
            .get(ev.message.channel.id)
            ?.keys() ?? []),
        ];
        matchFunc(ev, messageIds, action);
      }
    }
  };
}
export type ReactionFilterController = {
  watchingMessageId: Set<string>;
  unwatch: (message: Message) => void;
  watch: (message: Message) => void;
};
export function createReactionFilter(): ReactionFilterController {
  const watchingMessageId: Set<string> = new Set();
  const controller = {
    watchingMessageId: watchingMessageId,
    unwatch: (message: Message) => {
      watchingMessageId.delete(message.id);
    },
    watch: (message: Message) => {
      watchingMessageId.add(message.id);
    },
  };
  return controller;
}
export function filterReaction<EventMap extends ReactionEventMixinMap>(
  controller: ReactionFilterController
): ReactionHandler<EventMap> {
  return (ev, { next }) => {
    if (controller.watchingMessageId.has(ev.reaction.message.id)) {
      next();
    }
  };
}
