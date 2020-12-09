import { EmbedFieldData, GuildMember } from "discord.js";
import { MessageEmbed } from "discord.js";
import { DMChannel, NewsChannel, TextChannel, User } from "discord.js";
import { BotLogger } from "presentation_core";
import { Executor } from "protocol_util-djs";
import { merge, Subject, timer } from "rxjs";
import { mapTo } from "rxjs/operators";
import { Action } from "./action";
import {
  buildActionPipeline,
  ConnectableObservableRxEnv,
} from "./action-pipeline";
import { createReducer } from "./reducer";
import { createRender, View } from "./render";
import { State } from "./state";

export async function viewStart(
  view: View,
  rxEnv: ConnectableObservableRxEnv,
  channel: TextChannel | NewsChannel | DMChannel,
  author: User,
  maxIndex: number
): Promise<void> {
  const render = createRender(view)(channel);
  let state: State = {
    type: "normal",
    index: 0,
  };
  const targetMessage = await render(state);
  const forceTimeout = timer(1000 * 60 * 10).pipe(
    mapTo<unknown, Action>({ type: "Exit" })
  );
  const timeout = new Subject<Action>();
  const scheduleTimeout = () => {
    return setTimeout(() => {
      timeout.next({
        type: "Exit",
      });
      timeout.complete();
    }, 1000 * 60);
  };
  let timeoutHandle = scheduleTimeout();
  const pipeline = merge(
    buildActionPipeline(rxEnv, targetMessage, author),
    forceTimeout,
    timeout
  );
  const reducer = createReducer(0, maxIndex);
  const subscription = pipeline.subscribe((action) => {
    if (action == null) {
      return;
    }
    state = reducer(state, action);
    render(state).catch((err) => BotLogger.error(err, "Error while render"));
    clearTimeout(timeoutHandle);
    if (state.type === "exit") {
      subscription.unsubscribe();
    } else {
      timeoutHandle = scheduleTimeout();
    }
  });
}
export interface CreateViewResponses {
  createBaseEmbed: (
    exec: Executor,
    index: number,
    maxIndex: number
  ) => MessageEmbed;
  createHelpEmbed: (exec: Executor) => MessageEmbed;
  createEmptyEmbed: (exec: Executor) => MessageEmbed;
}
export function createView<T>(
  splited: T[][],
  responses: CreateViewResponses,
  createFields: (e: T) => EmbedFieldData,
  author: User,
  member: GuildMember | undefined | null
): View {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async (state) => {
    if (state.type === "normal") {
      if (splited.length === 0) {
        return responses.createEmptyEmbed({
          user: author,
          member: member,
        });
      }
      return responses
        .createBaseEmbed(
          {
            user: author,
            member: member,
          },
          state.index,
          splited.length
        )
        .addFields(splited[state.index].map(createFields));
    }
    if (state.type === "help") {
      return responses.createHelpEmbed({
        user: author,
        member: member,
      });
    }
    throw new TypeError("NEVER REACH@main-dictionary#list#view");
  };
}
