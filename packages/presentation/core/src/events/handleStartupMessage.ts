import { Event, EventStore } from "klasa";
import { inject, autoInjectable } from "tsyringe";
import { InstanceState } from "../instanceState";
import { GUJ_LAUNCH_CHANNEL } from "../bootstrap/env";
import { Message, MessageEmbed } from "discord.js";
@autoInjectable()
export default class extends Event {
  constructor(
    store: EventStore,
    file: string[],
    directory: string,
    @inject("InstanceState") private instanceState: InstanceState
  ) {
    super(store, file, directory, {
      event: "message",
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
    }
    embed.setTitle("Receive Starting");
    embed.addField("New", "terminated");
    embed.setColor(this.client.options.themeColor);
    await message.sendEmbed(embed);
    message.client.once("disconnect", () => {
      process.exit(0);
    });
    message.client.destroy();
  }
}
