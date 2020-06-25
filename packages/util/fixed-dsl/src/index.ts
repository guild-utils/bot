import {
  GameEventTimingFixed,
  GameEventTimingFixedEntry,
} from "pdomain/game-event";
import { regexp, whitespace, int, ParjsCombinator, ResultKind } from "parjs";
import {
  between,
  then,
  map,
  or,
  manySepBy,
  flatten,
  defineCombinator,
} from "parjs/combinators";
import { ParsingState, ParjserBase } from "parjs/internal";
const weakOfDay = regexp(/Sun|Mon|Tue|Wed|Thu|Fri|Sat/)
  .pipe(map((e) => e[0]))
  .pipe(between(whitespace()));
const mappingweakSL = Object.freeze({
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
});
function trial<T>(): ParjsCombinator<T, T> {
  return defineCombinator((source) => {
    return new (class Trial extends ParjserBase {
      type = "trial";
      expecting = source.expecting;

      _apply(ps: ParsingState): void {
        const { position } = ps;
        source.apply(ps);
        if (ps.isHard || ps.isSoft) {
          // if inner succeeded, we backtrack.
          ps.position = position;
          ps.kind = ResultKind.SoftFail;
        }

        // whatever code ps had, we return it.
      }
    })();
  });
}
const timeFull = int()
  .pipe(between(whitespace()))
  .pipe(then(":"))
  .pipe(map((e) => e[0]))
  .pipe(then(int().pipe(between(whitespace()))));
const time0 = int()
  .pipe(between(whitespace()))
  .pipe(map((e): [number, number] => [e, 0]));
const time = timeFull.pipe(trial()).pipe(or(time0));
const times = time.pipe(manySepBy(","));
const timingEntry = weakOfDay
  .pipe(then(times.pipe(between("[", "]"))))
  .pipe(
    map(([d, mss], st) =>
      mss.map(
        (e) =>
          new GameEventTimingFixedEntry(mappingweakSL[d], e[0], e[1], st.tz)
      )
    )
  );
const timing = timingEntry
  .pipe(manySepBy(","))
  .pipe(flatten<GameEventTimingFixedEntry>())
  .pipe(map((e) => new GameEventTimingFixed(e)));
export class FixedDSLParser {
  async parse(src: string, tz: string): Promise<GameEventTimingFixed> {
    const r = timing.parse(src, { tz });
    if (r.isOk) {
      return r.value;
    }
    throw new TypeError(`invalid source string ${src}`);
  }
}
