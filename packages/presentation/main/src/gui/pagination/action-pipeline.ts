import {
  ConnectableObservable,
  fromEvent,
  Observable,
  merge,
  Subscription,
} from "rxjs";
import * as Op from "rxjs/operators";
import {
  Client,
  Message,
  MessageReaction,
  PartialMessage,
  User,
} from "discord.js";
import { Action, action } from "./action";

export type Reducer<S, A> = (state: S, action: A) => S;
export interface ConnectableObservableRxEnv {
  readonly message: ConnectableObservable<Message | PartialMessage>;
  readonly reactionAdd: ConnectableObservable<[MessageReaction, User]>;
  readonly reactionRemove: ConnectableObservable<[MessageReaction, User]>;
}
export interface ObservableRxEnv {
  readonly message: Observable<Message | PartialMessage>;
  readonly reactionAdd: Observable<[MessageReaction, User]>;
  readonly reactionRemove: Observable<[MessageReaction, User]>;
}
export function createRxEnv(client: Client): ConnectableObservableRxEnv {
  return {
    message: Op.publish<Message | PartialMessage>()(
      fromEvent(client, "message")
    ),
    reactionAdd: Op.publish<[MessageReaction, User]>()(
      fromEvent(client, "messageReactionAdd")
    ),
    reactionRemove: Op.publish<[MessageReaction, User]>()(
      fromEvent(client, "messageReactionRemove")
    ),
  };
}
export function filter(
  rxEnv: ObservableRxEnv,
  targetMsg: Message,
  author: User
): ObservableRxEnv {
  const reactionFilter = Op.filter<[MessageReaction, User]>(
    ([reaction, user]) =>
      targetMsg.id === reaction.message.id && user.id === author.id
  );
  return {
    message: rxEnv.message.pipe(
      Op.filter((msg) => targetMsg.channel.id === msg.channel.id)
    ),
    reactionAdd: rxEnv.reactionAdd.pipe(reactionFilter),
    reactionRemove: rxEnv.reactionRemove.pipe(reactionFilter),
  };
}
export type ContentRxEnv = Record<
  "message" | "reactionAdd" | "reactionRemove",
  Observable<string | null>
>;
export function toContent(rxEnv: ObservableRxEnv): ContentRxEnv {
  const reactionMap = Op.map<[MessageReaction, User], string>(([reaction]) => {
    return reaction.emoji.name;
  });
  return {
    message: rxEnv.message.pipe(Op.map((message) => message.content)),
    reactionAdd: rxEnv.reactionAdd.pipe(reactionMap),
    reactionRemove: rxEnv.reactionRemove.pipe(reactionMap),
  };
}

export function buildActionPipeline(
  env: ConnectableObservableRxEnv,
  targetMsg: Message,
  author: User
): Observable<Action | undefined> {
  const filtered = filter(env, targetMsg, author);
  const content = toContent(filtered);
  return merge(
    content.message,
    content.reactionAdd,
    content.reactionRemove
  ).pipe(Op.map((content) => (content ? action(content) : undefined)));
}
export function connectRxEnv(
  rxEnv: ConnectableObservableRxEnv
): Subscription[] {
  return [
    rxEnv.message.connect(),
    rxEnv.reactionAdd.connect(),
    rxEnv.reactionRemove.connect(),
  ];
}
