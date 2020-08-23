import { GuiBase, Constructor, EventBase } from "../base";
import { Message } from "discord.js";

export interface MessageFilterController {
  unwatch(message: Message): void;
  watch(message: Message): void;
}

export function mixinMessageFilterController<
  EventMap extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k in string]: EventBase<k>;
  },
  TBase extends Constructor<GuiBase<EventMap>>
>(Base: TBase, controllers: MessageFilterController[]): TBase {
  return class extends Base {
    watchMessage(message: Message): void {
      controllers.forEach((controller) => controller.watch(message));
    }
    unwatchMessage(message: Message): void {
      controllers.forEach((controller) => controller.unwatch(message));
    }
  };
}
