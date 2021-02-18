import { Client, ClientOptions, VoiceChannel } from "discord.js";
import { Readable } from "stream";

export interface GuildBellState {
  channels: Set<string>;
}

export interface Controller {
  start(channel: string): Promise<boolean>;
  end(channel: string): Promise<boolean>;
  play(channel: string, sound: Readable): void;
}
export type Context = {
  client: Client;
  controller: Controller;
};
async function onReady(client: Client, onError: (error: unknown) => void) {
  await Promise.all(
    client.channels.cache
      .filter((e): e is VoiceChannel => {
        return (
          e.type === "voice" &&
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          (e as VoiceChannel).members.has(client.user!.id)
        );
      })
      .map((e) => {
        return (e as VoiceChannel).join().catch(onError);
      })
  );
}
export function bellBotClient(
  clientOptions: ClientOptions,
  onError: (error: unknown) => void
): Context {
  const client = new Client(clientOptions);
  client.on("ready", () => {
    onReady(client, onError).catch(onError);
  });
  return {
    client,
    controller: {
      start: async (channelId) => {
        const channel = client.channels.resolve(channelId);
        if (channel && channel.type === "voice") {
          const vc = channel as VoiceChannel;
          if (!vc.joinable) {
            return false;
          }
          await vc.join();
          return true;
        } else {
          return false;
        }
      },
      end: (channelId) => {
        const channel = client.channels.resolve(channelId);
        if (channel && channel.type === "voice") {
          const vc = channel as VoiceChannel;
          vc.leave();
          return Promise.resolve(true);
        } else {
          return Promise.resolve(false);
        }
      },
      play: (channelId, sound) => {
        const connection = client.voice?.connections.find(
          (connection) => connection.channel.id === channelId
        );
        if (!connection) {
          return;
        }
        const player = connection.play(sound, { type: "ogg/opus" });
        player.on("error", onError);
      },
    },
  };
}
