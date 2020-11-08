import { DependencyContainer } from "tsyringe";
import { InstanceState } from "../util/instance-state";
import { MessageEmbed, TextChannel, Client, ColorResolvable } from "discord.js";
import { GUJ_LAUNCH_CHANNEL, GUJ_GRACEFUL_SHUTDOWN_TIME } from "./env";
import { BotLogger } from "../loggers";

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
    BotLogger.info("SIGTERM");
    handleSigterm(client, state, color).catch((e) => BotLogger.error(e));
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
    BotLogger.info("graceful shutdown");
    client.once("disconnect", () => {
      process.exit(0);
    });
    BotLogger.info("graceful shutdown");
    client.destroy();
    process.exit();
  } else {
    instanceState.setState("terminating");
    embed.addField("New", "terminating");
    setTimeout(() => {
      BotLogger.info("not graceful shutdown");
      client.destroy();
      process.exit();
    }, GUJ_GRACEFUL_SHUTDOWN_TIME * 1000);
  }
}
