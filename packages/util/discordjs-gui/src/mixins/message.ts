import { GuiBase, AnythingHandler, Constructor, ActionType } from "../base";
import { Message } from "discord.js";

export const MessageEventType = "Message";
export interface MessageEvent {
  message: Message;
}
export type MessageEventMixinMap = {
  [MessageEventType]: MessageEvent;
};
export interface MessageHandler<
  EventMap extends {
    [MessageEventType]: MessageEvent;
  }
> {
  (arg: MessageEvent, action: ActionType<EventMap>): void;
}
export interface MessageMixin<EventMap extends MessageEventMixinMap> {
  emitMessage(message: Message): void;
  useMessage(
    handler: MessageHandler<EventMap> | AnythingHandler<EventMap>
  ): void;
}
export function mixinMessage<
  EventMap extends MessageEventMixinMap,
  TBase extends Constructor<GuiBase<EventMap>>
>(Base: TBase): TBase {
  return class extends Base {
    emitMessage(message: Message): void {
      this.emit({ message, type: MessageEventType });
    }
    useMessage(
      handler:
        | MessageHandler<EventMap>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | AnythingHandler<EventMap>
    ): void {
      this.use(MessageEventType, handler);
    }
  };
}
