/* eslint-disable @typescript-eslint/no-explicit-any */
//https://canary.discordapp.com/channels/406357894427312148/578585150590418983/729212598217867348
//https://github.com/mayfieldiv/cypress/blob/issue-4022/cli/types/index.d.ts#L4522-L4541
type ExcludeUnknownArray<T> = unknown[] extends T ? never : T;
type OverloadedParameters<T> = T extends {
  (...args: infer A1): any;
  (...args: infer A2): any;
  (...args: infer A3): any;
  (...args: infer A4): any;
  (...args: infer A5): any;
}
  ?
      | ExcludeUnknownArray<A1>
      | ExcludeUnknownArray<A2>
      | ExcludeUnknownArray<A3>
      | ExcludeUnknownArray<A4>
      | ExcludeUnknownArray<A5>
  : T extends {
      (...args: infer A1): any;
      (...args: infer A2): any;
      (...args: infer A3): any;
      (...args: infer A4): any;
    }
  ?
      | ExcludeUnknownArray<A1>
      | ExcludeUnknownArray<A2>
      | ExcludeUnknownArray<A3>
      | ExcludeUnknownArray<A4>
  : T extends {
      (...args: infer A1): any;
      (...args: infer A2): any;
      (...args: infer A3): any;
    }
  ? ExcludeUnknownArray<A1> | ExcludeUnknownArray<A2> | ExcludeUnknownArray<A3>
  : T extends { (...args: infer A1): any; (...args: infer A2): any }
  ? ExcludeUnknownArray<A1> | ExcludeUnknownArray<A2>
  : T extends { (...args: infer A1): any }
  ? ExcludeUnknownArray<A1>
  : any[];
