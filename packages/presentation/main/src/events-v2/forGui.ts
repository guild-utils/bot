import { Client, MessageReaction, PartialUser, User } from "discord.js";
import { BotLogger } from "presentation_core";
import { Gui } from "../gui/common";
const Logger = BotLogger.child({ event: "forGui" });
export default function (client: Client, controllers: Gui[]): void {
  client.on("message", (message) => {
    controllers.forEach((e) => e.emitMessage(message));
  });
  async function run(reaction: MessageReaction, rawuser: User | PartialUser) {
    const user = rawuser.partial ? await rawuser.fetch() : rawuser;
    controllers.forEach((e) => e.emitReaction(reaction, user));
  }
  client.on("messageReactionAdd", (reaction, rawuser) => {
    run(reaction, rawuser).catch((e) => Logger.error(e, "messageReactionAdd"));
  });
  client.on("messageReactionRemove", (reaction, rawuser) => {
    run(reaction, rawuser).catch((e) =>
      Logger.error(e, "messageReactionRemove")
    );
  });
}
