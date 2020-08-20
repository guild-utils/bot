import { AnythingHandler, Pagination, Constructor, ActionType } from "../base";
import { Message } from "discord.js";
const TimeoutEventType = "Timeout";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TimeoutEvent = any;
export type TimeoutEventMixinMap = {
  [TimeoutEventType]: TimeoutEvent;
};
interface TimeoutHandler<EventMap extends TimeoutEventMixinMap> {
  (ev: TimeoutEvent, action: ActionType<EventMap>): void;
}
export interface TimeoutMixin<EventMap extends TimeoutEventMixinMap> {
  emitTimeout(message: Message): void;
  useTimeout(
    handler: TimeoutHandler<EventMap> | AnythingHandler<EventMap>
  ): void;
}
export function mixinTimeout<
  EventMap extends TimeoutEventMixinMap,
  TBase extends Constructor<Pagination<EventMap>>
>(Base: TBase): TBase {
  return class extends Base {
    emitTimeout(ev: EventMap["Timeout"]): void {
      this.emit(TimeoutEventType, ev);
    }

    useTimeout(
      handler: TimeoutHandler<EventMap> | AnythingHandler<EventMap>
    ): void {
      this.use("Timeout", handler);
    }
  };
}
