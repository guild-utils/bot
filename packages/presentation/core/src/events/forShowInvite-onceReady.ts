import { Client } from "discord.js";
import { BotLogger } from "../loggers";
export default function (client: Client, inviteLink: string): void {
  client.once("ready", () => {
    BotLogger.info(
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        loggedInAs: {
          userId: client.user?.id,
          userName: client.user?.username,
          userDiscriminator: client.user?.discriminator,
        },
        inviteLink,
      },
      "ready!"
    );
  });
}
