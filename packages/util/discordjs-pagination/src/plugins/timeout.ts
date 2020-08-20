export type TimeoutScheduler<Ctx> = {
  schedule(id: string, ctx: Ctx, ms: number): void;
  delete(id: string): void;
};
class TimeoutSchedulerImpl<Ctx> implements TimeoutScheduler<Ctx> {
  private readonly map = new Map<string, { ctx: Ctx; token: NodeJS.Timeout }>();
  constructor(private readonly cb: (id: string, ctx: Ctx) => unknown) {}
  schedule(id: string, ctx: Ctx, ms: number): void {
    const v = this.map.get(id);
    if (v) {
      globalThis.clearTimeout(v.token);
    }
    this.map.set(id, {
      ctx,
      token: globalThis.setTimeout(this.cb, ms, id, ctx),
    });
  }
  delete(id: string): void {
    const v = this.map.get(id);
    if (!v) {
      return;
    }
    globalThis.clearTimeout(v.token);
    this.map.delete(id);
  }
}
export function createTimeoutScheduler<Ctx>(
  cb: (id: string, ctx: Ctx) => unknown
): TimeoutScheduler<Ctx> {
  return new TimeoutSchedulerImpl(cb);
}
