import { Event, EventStore } from "klasa";
import { GUJ_LAUNCH_CHANNEL } from "../bootstrap/env";
import { MessageEmbed, TextChannel } from "discord.js";
import { InstanceState } from "../instanceState";
import { inject, autoInjectable } from "tsyringe";
@autoInjectable()
export default class extends Event {
  constructor(
    store: EventStore,
    file: string[],
    directory: string,
    @inject("InstanceState") private instanceState: InstanceState
  ) {
    super(store, file, directory, {
      once: true,
      event: "klasaReady",
    });
  }
  async run(): Promise<void> {
    const embed = new MessageEmbed();
    embed.setTitle("Starting");
    embed.addField("Current", this.instanceState.state);
    embed.addField("New", "running");
    embed.setColor(this.client.options.themeColor);
    const channel = await this.client.channels.fetch(GUJ_LAUNCH_CHANNEL);
    await (channel as TextChannel).sendEmbed(embed);
    this.instanceState.setState("running");
  }
}
