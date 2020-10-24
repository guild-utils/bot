import { Client } from "discord.js";
export default function (client: Client, inviteLink: string): void {
  client.once("ready", () => {
    console.log(
      [
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        `Logged in as: ${client.user!.tag}`,
        `Invite Link: ${inviteLink}`,
      ].join("\n")
    );
  });
}
