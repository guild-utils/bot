import { GuiBase, AnythingHandler, Constructor, ActionType } from "../base";
import { MessageReaction, User } from "discord.js";

export const ReactionEventType = "Reaction";
export interface ReactionEvent {
  reaction: MessageReaction;
  user: User;
}
export type ReactionEventMixinMap = {
  [ReactionEventType]: ReactionEvent;
};
export interface ReactionHandler<EventMap extends ReactionEventMixinMap> {
  (arg: ReactionEvent, action: ActionType<EventMap>): void;
}

export interface ReactionMixin<EventMap extends ReactionEventMixinMap> {
  emitReaction(raection: MessageReaction, user: User): void;
  useReaction(
    handler: ReactionHandler<EventMap> | AnythingHandler<EventMap>
  ): void;
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mixinReaction<
  EventMap extends ReactionEventMixinMap,
  TBase extends Constructor<GuiBase<EventMap>>
>(Base: TBase) {
  return class extends Base {
    emitReaction(reaction: MessageReaction, user: User): void {
      this.emit({ type: ReactionEventType, reaction, user });
    }
    useReaction(
      handler: ReactionHandler<EventMap> | AnythingHandler<EventMap>
    ): void {
      this.use(ReactionEventType, handler);
    }
  };
}
