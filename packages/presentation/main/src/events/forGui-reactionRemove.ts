import { Event, EventStore } from "klasa";
import { autoInjectable, inject } from "tsyringe";
import { Gui } from "../gui/common";
import { MessageReaction, User } from "discord.js";
@autoInjectable()
export default class extends Event {
  constructor(
    store: EventStore,
    file: string[],
    directory: string,
    @inject("GuiControllers")
    private controllers: Gui[]
  ) {
    super(store, file, directory, {
      event: "messageReactionRemove",
    });
  }
  run(reaction: MessageReaction, user: User): void {
    this.controllers.forEach((e) => e.emitReaction(reaction, user));
  }
}
