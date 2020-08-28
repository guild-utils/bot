import { DependencyContainer } from "tsyringe";
import { InstanceState } from "../instanceState";
import { MessageEmbed, TextChannel, Client } from "discord.js";
import { GUJ_LAUNCH_CHANNEL, GUJ_GRACEFUL_SHUTDOWN_TIME } from "./env";

export function initInstanceState(
  container: DependencyContainer,
  client: Client
): InstanceState {
  const state = new InstanceState();
  container.register("InstanceState", {
    useValue: state,
  });
  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handleSigterm(client, state).catch(console.log);
  });
  return state;
}
export async function handleSigterm(
  client: Client,
  instanceState: InstanceState
): Promise<void> {
  const embed = new MessageEmbed();
  embed.setTitle("SIGTERM");
  embed.addField("Current", instanceState.state);
  embed.addField("New", "terminating");
  embed.setColor(client.options.themeColor);
  const channel = await client.channels.fetch(GUJ_LAUNCH_CHANNEL);
  await (channel as TextChannel).sendEmbed(embed);
  if (instanceState.state === "terminating") {
    client.once("disconnect", () => {
      process.exit(0);
    });
    client.destroy();
  } else {
    instanceState.setState("terminating");
    setTimeout(() => {
      client.once("disconnect", () => {
        process.exit(0);
      });
      client.destroy();
    }, GUJ_GRACEFUL_SHUTDOWN_TIME * 1000);
  }
}
