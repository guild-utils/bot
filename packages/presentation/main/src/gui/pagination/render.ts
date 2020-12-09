import {
  DMChannel,
  EmojiResolvable,
  Message,
  MessageEmbed,
  NewsChannel,
  TextChannel,
} from "discord.js";
import { State } from "./state";
import { AbortController } from "abort-controller";
import { BotLogger } from "presentation_core";
export type View = (state: State) => Promise<MessageEmbed>;
export type Render = (state: State) => Promise<Message>;
export async function serealAddReaction(
  message: Message,
  reactions: EmojiResolvable[],
  signal?: AbortSignal
): Promise<void> {
  for (const reaction of reactions) {
    if (signal?.aborted) {
      return;
    }
    await message.react(reaction);
  }
}

export function createRender(
  view: View
): (channel: TextChannel | NewsChannel | DMChannel) => Render {
  return (channel) => {
    let message: Promise<Message> | undefined;
    let reactions: Promise<void> | undefined;
    let abortController: AbortController | undefined;
    const reactionAbortController = new AbortController();
    return async (state) => {
      if (state.type === "exit") {
        const msg = await message;
        reactionAbortController.abort();
        await reactions;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return msg!.reactions.removeAll();
      }
      if (message == null) {
        message = channel.send(await view(state));
        message.catch((err) =>
          BotLogger.error(err, "An error occured while send list view.")
        );
        reactions = message.then((msg) =>
          serealAddReaction(
            msg,
            ["\u23ea", "\u25c0", "\u23f9", "\u25b6", "\u23e9", "\u2753"],
            reactionAbortController.signal
          )
        );
        reactions.catch((err) =>
          BotLogger.error(err, "An error occured while react list view.")
        );
      } else {
        abortController?.abort();
        abortController = new AbortController();
        const signal = abortController.signal;
        const oldMessage = message;
        message = view(state).then((embed) => {
          if (signal.aborted) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return oldMessage;
          }
          return oldMessage.then((message) => {
            if (signal.aborted) {
              return oldMessage;
            }
            return message.edit(embed);
          });
        });
        message.catch((err) =>
          BotLogger.error(err, "An error occured while update list view.")
        );
      }
      return message;
    };
  };
}
