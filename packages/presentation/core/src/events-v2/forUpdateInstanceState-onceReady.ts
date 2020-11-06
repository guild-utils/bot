import { ColorResolvable, MessageEmbed, TextChannel } from "discord.js";
import { Client } from "discord.js";
import { InstanceState } from "../util/instance-state";
import { GUJ_LAUNCH_CHANNEL } from "../bootstrap/env";

export default function (
  client: Client,
  instanceState: InstanceState,
  color: ColorResolvable
): void {
  async function f() {
    const embed = new MessageEmbed();
    embed.setTitle("Starting");
    embed.addField("Current", instanceState.state);
    embed.addField("New", "running");
    embed.setColor(color);
    const channel = await client.channels.fetch(GUJ_LAUNCH_CHANNEL);
    await (channel as TextChannel).send(embed);
  }
  client.once("ready", (): void => {
    f().catch(console.log);
  });
}
