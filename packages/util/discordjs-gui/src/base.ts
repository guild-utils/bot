// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any
export type Constructor<T = {}> = new (...a: any[]) => T;
export type PaginationConstructor<
  T extends Pagination<EventMap>,
  EventMap extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k in string]: any;
  }
> = new (
  handlers?: {
    [k in keyof EventMap]?: HandlerBase<EventMap[k], EventMap>[];
  }
) => T;

export interface EventBase<T> {
  type: T;
}
export type ActionType<
  EventMap extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k in string]: any;
  }
> = { next: NextFunction; emit: EmitFunction<EventMap> };

export interface HandlerBase<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  K extends keyof EventMap,
  EventMap extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k in string]: any;
  }
> {
  (arg: EventMap[K] & EventBase<K>, action: ActionType<EventMap>): void;
}
export interface NextFunction {
  (): void;
}
export interface EmitFunction<
  EventMap extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k in string]: any;
  }
> {
  <K extends keyof EventMap>(k: K, ev: EventMap[K]): void;
  <K extends keyof EventMap>(ev: EventMap[K] & EventBase<K>): void;
}
export interface AnythingHandler<
  EventMap extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k in string]: any;
  }
> {
  (
    arg: EventBase<unknown>,
    action: { next: NextFunction; emit: EmitFunction<EventMap> }
  ): void;
}

export class Pagination<
  EventMap extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k in string]: any;
  }
> {
  constructor(
    public handlers: {
      [k in keyof EventMap]?: HandlerBase<EventMap[k], EventMap>[];
    } = {}
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use(handler: AnythingHandler<EventMap>): void;
  use<K extends keyof EventMap>(
    key: K,
    handler: HandlerBase<K, EventMap>
  ): void;
  use<K extends keyof EventMap>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arg1: AnythingHandler<EventMap> | K,
    arg2?: HandlerBase<EventMap[K], EventMap>
  ): void {
    if (arg2) {
      let collection = this.handlers[arg1 as K];
      if (!collection) {
        this.handlers[arg1 as K] = collection = [];
      }
      collection.push(arg2);
    } else {
      Object.values<HandlerBase<EventMap[K], EventMap>[]>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.handlers as any
      ).forEach((collection) => {
        collection.push(arg1 as AnythingHandler<EventMap>);
      });
    }
  }
  handle<K extends keyof EventMap>(ev: EventMap[K], idx = 0): void {
    const collection = this.handlers[ev.type as K];
    if (!collection) {
      return;
    }
    const f = collection[idx];
    if (!f) {
      return;
    }
    f(ev, {
      next: () => {
        return this.handle<K>(ev, idx + 1);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      emit: (arg1: any, arg2?: any) => {
        this.emit(arg1, arg2);
      },
    });
  }
  emit<K extends keyof EventMap>(k: K, ev: EventMap[K]): void;
  emit<K extends keyof EventMap>(ev: EventMap[K] & EventBase<K>): void;
  emit<K extends keyof EventMap>(
    k: K | EventMap[K],
    ev?: Omit<EventMap[K], "type"> | EventMap[K]
  ): void {
    if (typeof k === "object") {
      this.handle(k, 0);
    } else if (typeof ev === "undefined") {
      throw new Error("Invalid Event Emitted");
    } else {
      const type = k;
      const ev2 = { ...ev, type } as EventMap[K] & { type: K };
      this.handle<K>(ev2, 0);
    }
  }
}
