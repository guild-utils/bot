type ResetTime = number; //millsec

class RateLimit<K> {
  private readonly _queue = new Map<K, [number, ResetTime]>();
  constructor(
    private readonly limitAndExpire: (
      k: K,
      now: number
    ) => Promise<[number, ResetTime]>
  ) {}
  private cf(k: K, nn: number, rt: ResetTime): [boolean, ResetTime] {
    if (nn < 0) {
      return [false, rt];
    }
    this._queue.set(k, [nn, rt]);
    return [true, rt];
  }
  public async consume(
    k: K,
    n = 1,
    now = Date.now()
  ): Promise<[boolean, ResetTime]> {
    let v = this._queue.get(k);
    if (!v) {
      v = await this.limitAndExpire(k, now);
      const [cnt, rt] = v;
      setTimeout(() => {
        const v = this._queue.get(k);
        if (v && v[1] === rt) {
          this._queue.delete(k);
        }
      }, rt - now);
      const nn = cnt - n;
      return this.cf(k, nn, rt);
    }
    const [cnt, rt] = v;
    if (rt < now) {
      this._queue.delete(k);
      return this.consume(k, n, now);
    }
    const nn = cnt - n;
    return this.cf(k, nn, rt);
  }
}
