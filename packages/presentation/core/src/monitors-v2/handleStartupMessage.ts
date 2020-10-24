import { InstanceState } from "../instanceState";
import { GUJ_LAUNCH_CHANNEL } from "../bootstrap/env";
import { ColorResolvable, Message, MessageEmbed } from "discord.js";
import { MonitorBase } from "monitor-discord.js";
export default class extends MonitorBase {
  constructor(
    private instanceState: InstanceState,
    private readonly color: ColorResolvable
  ) {
    super({
      ignoreOthers: true,
      ignoreBots: false,
      ignoreEdits: true,
      ignoreSelf: false,
      ignoreWebhooks: false,
    });
  }
  async run(message: Message): Promise<void> {
    if (message.author.id !== message.client.user?.id) {
      return;
    }
    if (message.channel.id !== GUJ_LAUNCH_CHANNEL) {
      return;
    }
    if (!message.embeds.length) {
      return;
    }
    if (!message.embeds.some((e) => e.title === "Starting")) {
      return;
    }
    const embed = new MessageEmbed();
    embed.addField("Current", this.instanceState.state);
    if (this.instanceState.state === "starting") {
      this.instanceState.setState("running");
      return;
    } else if (this.instanceState.state === "running") {
      this.instanceState.setState("terminating");
      embed.setTitle("Receive Starting");
      embed.addField("New", "terminating");
      embed.setColor(this.color);
      await message.channel.send(embed);
      return;
    } else {
      embed.setTitle("Receive Starting");
      embed.addField("New", "terminated");
      embed.setColor(this.color);
      await message.channel.send(embed);
      console.log("graceful shutdown");
      message.client.destroy();
      process.exit();
    }
  }
}
