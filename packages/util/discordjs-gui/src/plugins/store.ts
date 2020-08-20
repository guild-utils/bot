import { Message } from "discord.js";
export type MessageContextController<Ctx> = {
  contexts: Map<string, Ctx>;
  unregister: (message: Message) => void;
  register: (message: Message, context: Ctx) => void;
};
export function createMessageContext<Ctx>(): MessageContextController<Ctx> {
  const contexts = new Map<string, Ctx>();
  const controller = {
    contexts,
    unregister: (message: Message) => {
      contexts.delete(message.id);
    },
    register: (message: Message, context: Ctx) => {
      contexts.set(message.id, context);
    },
  };
  return controller;
}
