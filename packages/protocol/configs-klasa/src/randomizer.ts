import { XorShift } from "xorshift";
function uniformint(self: XorShift, a: number, b: number) {
  return Math.floor(a + self.random() * (b - a));
}
function uniformreal(self: XorShift, a: number, b: number, fix: number) {
  return uniformint(self, a * fix, b * fix) / fix;
}
class RandomizerV1 {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(key: string[]): any {
    if (key[0] !== "speech") {
      throw new TypeError();
    }
    const obj = {
      kind: "neutral",
      speed: 1.0,
      tone: 0.0,
      volume: 0.0,
      allpass: undefined,
      intone: 1,
      threshold: 0.5,
    };
    if (!(key[1] in obj)) {
      throw new TypeError();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return obj[key[1]];
  }
}
class RandomizerV2 {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly obj: any;
  constructor(user: string) {
    const i = BigInt(user);
    const h = Number(BigInt.asUintN(32, i >> 32n));
    const l = Number(BigInt.asUintN(32, i));
    const r = new XorShift([0, 0, h, l]);
    const kinds = [
      "angry",
      "happy",
      "neutral",
      "sad",
      "mei_angry",
      "mei_bashful",
      "mei_happy",
      "mei_normal",
      "mei_sad",
      "takumi_angry",
      "takumi_happy",
      "takumi_normal",
      "takumi_sad",
    ];
    this.obj = {
      kind: kinds[uniformint(r, 0, kinds.length)] ?? "neutral", //This is probably not necessary, but just in case.
      speed: uniformreal(r, 1.0, 1.5, 100),
      tone: uniformreal(r, -1.0, 1.0, 100),
      volume: 0.0,
      allpass: undefined,
      intone: 1,
      threshold: 0.5,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(key: string[]): any {
    if (key[0] !== "speech") {
      throw new TypeError();
    }

    if (!(key[1] in this.obj)) {
      throw new TypeError();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return this.obj[key[1]];
  }
}
export const randomizers = {
  v1: RandomizerV1,
  v2: RandomizerV2,
};
