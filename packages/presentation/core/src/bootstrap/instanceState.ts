import { DependencyContainer } from "tsyringe";
import { InstanceState } from "../instanceState";
import { MessageEmbed, TextChannel, Client, ColorResolvable } from "discord.js";
import { GUJ_LAUNCH_CHANNEL, GUJ_GRACEFUL_SHUTDOWN_TIME } from "./env";

export function initInstanceState(
  container: DependencyContainer,
  client: Client,
  color: ColorResolvable
): InstanceState {
  const state = new InstanceState();
  container.register("InstanceState", {
    useValue: state,
  });
  process.on("SIGTERM", () => {
    console.log("SIGTERM");
    handleSigterm(client, state, color).catch(console.log);
  });
  return state;
}
export async function handleSigterm(
  client: Client,
  instanceState: InstanceState,
  color: ColorResolvable
): Promise<void> {
  const embed = new MessageEmbed();
  embed.setTitle("SIGTERM");
  embed.addField("Current", instanceState.state);
  embed.setColor(color);
  const channel = await client.channels.fetch(GUJ_LAUNCH_CHANNEL);

  if (instanceState.state === "terminating") {
    embed.addField("New", "terminated");
    await (channel as TextChannel).send(embed);
    console.log("graceful shutdown");
    client.once("disconnect", () => {
      process.exit(0);
    });
    console.log("graceful shutdown");
    client.destroy();
    process.exit();
  } else {
    instanceState.setState("terminating");
    embed.addField("New", "terminating");
    setTimeout(() => {
      console.log("not graceful shutdown");
      client.destroy();
      process.exit();
    }, GUJ_GRACEFUL_SHUTDOWN_TIME * 1000);
  }
}
