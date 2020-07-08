import * as moment from "moment-timezone";

import {
  GameEventRepository,
  GameEventCollection,
  GameEvent,
  HKTCollectionName,
  HKTCollectionNameU,
  nextTiming,
} from "domain_core/game-event";

export abstract class GameEventUseCase {
  abstract async listCollectionName(
    collectionGroupId: string
  ): Promise<HKTCollectionNameU<HKTCollectionName>[]>;
  abstract async collection(
    collectionGroupId: string,
    collectionName: string
  ): Promise<GameEventCollection<HKTCollectionName>>;
  abstract async put(
    collectionGroupId: string,
    collectionName: string,
    src: (string | null)[]
  ): Promise<void>;
  abstract async allEvents(
    collectionGroupId: string
  ): Promise<[GameEventCollection<HKTCollectionName>, GameEvent][]>;
  abstract async nextEvents(
    collectionGroupId: string,
    now: moment.Moment
  ): Promise<
    [GameEventCollection<HKTCollectionName>, GameEvent, moment.Moment][]
  >;
  abstract async nextEventsWithName(
    collectionGroupId: string,
    collectionName: string,
    now: moment.Moment
  ): Promise<
    [GameEventCollection<HKTCollectionName>, [GameEvent, moment.Moment][]]
  >;
  abstract async updateLastNoticeTime(
    collectionGroupId: string,
    collectionName: string,
    event: GameEvent,
    time: moment.Moment
  ): Promise<void>;
}
export class GameEventUseCaseImpl<
  repoT extends GameEventRepository<collectionGroupIdT, HKTCollectionNameT>,
  collectionGroupIdT,
  HKTCollectionNameT extends HKTCollectionName
> extends GameEventUseCase {
  private readonly repo: repoT;
  constructor(repo: repoT) {
    super();
    this.repo = repo;
  }
  async listCollectionName(
    collectionGroupId: string
  ): Promise<HKTCollectionNameU<HKTCollectionNameT>[]> {
    const gid = await this.repo.collcetionGroupId(collectionGroupId);
    return await this.repo.listCollectionName(gid);
  }
  async allEvents(
    collectionGroupId: string
  ): Promise<[GameEventCollection<HKTCollectionNameT>, GameEvent][]> {
    const gid = await this.repo.collcetionGroupId(collectionGroupId);
    const names = await this.repo.listCollectionName(gid);
    return (
      await Promise.all(names.map((e) => this.repo.collection(gid, e)))
    ).flatMap((e) =>
      (e.events as GameEvent[]).map((e2: GameEvent): [
        GameEventCollection<HKTCollectionNameT>,
        GameEvent
      ] => [e, e2])
    );
  }
  async nextEvents(
    collectionGroupId: string,
    now: moment.Moment
  ): Promise<
    [GameEventCollection<HKTCollectionNameT>, GameEvent, moment.Moment][]
  > {
    const arr = (await this.allEvents(collectionGroupId))
      .map(([c, e3]: [GameEventCollection<HKTCollectionNameT>, GameEvent]): [
        GameEventCollection<HKTCollectionNameT>,
        GameEvent,
        moment.Moment | undefined
      ] => [c, e3, nextTiming(e3, now)])
      .filter((e) => e[2] !== undefined)
      .sort(([ac, ae, at], [bc, be, bt]) => at!.diff(bt));
    return arr as [
      GameEventCollection<HKTCollectionNameT>,
      GameEvent,
      moment.Moment
    ][];
  }
  async nextEventsWithName(
    collectionGroupId: string,
    collectionName: string,
    now: moment.Moment
  ): Promise<
    [GameEventCollection<HKTCollectionNameT>, [GameEvent, moment.Moment][]]
  > {
    const c = await this.collection(collectionGroupId, collectionName);
    const r = (c.events as GameEvent[])
      .map((e3: GameEvent): [GameEvent, moment.Moment | undefined] => [
        e3,
        nextTiming(e3, now),
      ])
      .filter((e) => e[1] !== undefined)
      .sort(([ae, at], [be, bt]) => at!.diff(bt));
    return [c, r as [GameEvent, moment.Moment][]];
  }
  async collection(
    collectionGroupId: string,
    collectionName: string
  ): Promise<GameEventCollection<HKTCollectionNameT>> {
    const gid = await this.repo.collcetionGroupId(collectionGroupId);
    return this.repo.collection(
      gid,
      await this.repo.collectionName(gid, collectionName)
    );
  }
  async put(
    collectionGroupId: string,
    collectionName: string,
    src: (string | null)[]
  ) {
    const gid = await this.repo.collcetionGroupId(collectionGroupId);
    return this.repo.put(
      gid,
      await this.repo.collectionName(gid, collectionName),
      src
    );
  }
  momentToSerial(date: moment.Moment) {
    return (
      date.diff({ year: 1899, month: 11, date: 30 }, "second") / (24 * 60 * 60)
    );
  }

  async updateLastNoticeTime(
    collectionGroupId: string,
    collectionName: string,
    event: GameEvent,
    time: moment.Moment
  ): Promise<void> {
    const gid = await this.repo.collcetionGroupId(collectionGroupId);
    return this.repo.update(
      gid,
      await this.repo.collectionName(gid, collectionName),
      event.header.map((e) => {
        if (e === "lastNotice") {
          return this.momentToSerial(time);
        }
        if (e === "name") {
          return event.name;
        }
        return null;
      })
    );
  }
}
