import { Client, MessageReaction, PartialUser, User } from "discord.js";
import { Gui } from "../gui/common";

export default function (client: Client, controllers: Gui[]): void {
  client.on("message", (message) => {
    controllers.forEach((e) => e.emitMessage(message));
  });
  async function run(reaction: MessageReaction, rawuser: User | PartialUser) {
    const user = rawuser.partial ? await rawuser.fetch() : rawuser;
    controllers.forEach((e) => e.emitReaction(reaction, user));
  }
  client.on("messageReactionAdd", (reaction, rawuser) => {
    run(reaction, rawuser).catch(console.log);
  });
  client.on("messageReactionRemove", (reaction, rawuser) => {
    run(reaction, rawuser).catch(console.log);
  });
}
