import type {
  ArgumentType,
  OptionalValueArgumentOption,
  PostionalArgumentOption,
} from "@guild-utils/command-schema";
import type { Options, PositionalOptions } from "yargs";
import type { MainParserContext } from "@guild-utils/command-parser";
import { Push } from "boost-ts";
export class NotResolvableError extends TypeError {
  constructor(text = "Command failed. Argument not resolvable.") {
    super(text);
  }
}
export class ArgumentTypeMismatchError extends NotResolvableError {
  constructor() {
    super("Command failed. Argument type mismatch.");
  }
}

export interface ArgumentTypeExtended<S extends symbol, V>
  extends ArgumentType<S> {
  position(
    o: PostionalArgumentOption,
    v: unknown,
    ctx: MainParserContext
  ): Promise<V>;
  yargsPosition(o: PostionalArgumentOption): PositionalOptions;
  option(
    o: OptionalValueArgumentOption<unknown>,
    v: unknown,
    ctx: MainParserContext
  ): Promise<V>;
  yargsOption(o: OptionalValueArgumentOption<unknown>): Options;
}
export abstract class Base<S extends symbol, V>
  implements ArgumentTypeExtended<S, V> {
  abstract resolverKey: S;
  abstract name: string;
  abstract resolve(v: unknown, ctx: MainParserContext): Promise<V>;
  position(
    o: PostionalArgumentOption,
    v: unknown,
    ctx: MainParserContext
  ): Promise<V> {
    return this.resolve(v, ctx);
  }
  option(
    o: OptionalValueArgumentOption<unknown>,
    v: unknown,
    ctx: MainParserContext
  ): Promise<V> {
    return this.resolve(v, ctx);
  }
  yargsPosition(o: PostionalArgumentOption): PositionalOptions {
    const base: PositionalOptions = o.variable ? { default: [] } : {};
    return Object.assign(base, this.yargs());
  }
  yargsOption(): Options {
    return this.yargs();
  }
  abstract yargs(): PositionalOptions & Options;
}

export const stringSymbol = Symbol("string");
export class AT_String extends Base<typeof stringSymbol, string> {
  resolverKey: typeof stringSymbol = stringSymbol;
  name = "string";
  // eslint-disable-next-line @typescript-eslint/require-await
  async resolve(v: unknown): Promise<string> {
    console.log(v, typeof v);
    if (typeof v !== "string") {
      throw new ArgumentTypeMismatchError();
    }
    return v;
  }
  yargs(): PositionalOptions & Options {
    return {
      type: "string",
    };
  }
}
export const boolSymbol = Symbol("bool");
const truths = ["1", "true", "+", "t", "yes", "y"];
const falses = ["0", "false", "-", "f", "no", "n"];
export class AT_Bool extends Base<typeof boolSymbol, boolean> {
  resolverKey: typeof boolSymbol = boolSymbol;
  name = "bool";
  resolve(v: unknown): Promise<boolean> {
    if (typeof v === "boolean") {
      return Promise.resolve(v);
    }
    if (typeof v === "number") {
      return Promise.resolve(!!v);
    }
    if (typeof v !== "string") {
      return Promise.reject(new ArgumentTypeMismatchError());
    }
    const vv = String(v).toLowerCase();
    if (truths.includes(vv)) {
      return Promise.resolve(true);
    }
    if (falses.includes(vv)) {
      return Promise.resolve(false);
    }
    return Promise.reject(new NotResolvableError());
  }
  yargs(): PositionalOptions & Options {
    return {};
  }
}

export const simpleArraySymbol = Symbol("simpleArray");
export class AT_SimpleArray<V> extends Base<typeof simpleArraySymbol, V[]> {
  resolverKey: typeof simpleArraySymbol = simpleArraySymbol;
  name: string;
  constructor(private readonly base: Base<symbol, V>) {
    super();
    this.name = "[..." + base.name + "]";
  }
  resolve(v: unknown, ctx: MainParserContext): Promise<V[]> {
    if (!Array.isArray(v)) {
      throw new NotResolvableError();
    }
    return Promise.all(v.map((e) => this.base.resolve(e, ctx)));
  }
  yargs(): PositionalOptions & Options {
    return this.base.yargs();
  }
}
export const orSymbol = Symbol("or");
export class AT_Or<T, U> extends Base<typeof orSymbol, T | U> {
  resolverKey: typeof orSymbol = orSymbol;
  name: string;
  constructor(
    private readonly a: Base<symbol, T>,
    private readonly b: Base<symbol, U>,
    private readonly opt: PositionalOptions & Options = {}
  ) {
    super();
    this.name = a.name + "|" + b.name;
  }
  async resolve(v: unknown, ctx: MainParserContext): Promise<T | U> {
    try {
      return await this.a.resolve(v, ctx);
    } catch {
      return await this.b.resolve(v, ctx);
    }
  }
  yargs(): PositionalOptions & Options {
    return this.opt;
  }
}
export const flagSymbol = Symbol("flag");
export class AT_Flag extends Base<typeof flagSymbol, boolean> {
  resolverKey: typeof flagSymbol = flagSymbol;
  name = "flag";
  constructor() {
    super();
  }
  resolve(v: unknown): Promise<boolean> {
    if (typeof v === "boolean") {
      return Promise.resolve(v);
    }
    return Promise.reject(new NotResolvableError());
  }
  yargs(): PositionalOptions & Options {
    return {
      type: "boolean",
      boolean: true,
    };
  }
}
function filterInt(value: string) {
  if (/^[-+]?(\d+|Infinity)$/.test(value)) {
    return Number(value);
  } else {
    return NaN;
  }
}

const integerSymbol = Symbol("integer");
export class AT_Integer extends Base<typeof integerSymbol, number> {
  resolverKey: typeof integerSymbol = integerSymbol;
  name = "integer";
  resolve(v: unknown): Promise<number> {
    switch (typeof v) {
      case "number":
        if (!Number.isNaN(v)) {
          return Promise.resolve(v);
        }
        return Promise.reject(new NotResolvableError());
      case "string": {
        const vv = filterInt(v);
        if (!Number.isNaN(vv)) {
          return Promise.resolve(vv);
        }
        return Promise.reject(new NotResolvableError());
      }
      default:
        return Promise.reject(new NotResolvableError());
    }
  }
  yargs(): PositionalOptions & Options {
    return {};
  }
}
export const argumentTypeExtendedSymbols = new Set([
  orSymbol,
  flagSymbol,
  boolSymbol,
  stringSymbol,
  simpleArraySymbol,
  integerSymbol,
]);
declare module "@guild-utils/command-schema" {
  interface CommandSchema<
    PositionResultTypeReversed extends unknown[] = [],
    // eslint-disable-next-line @typescript-eslint/ban-types
    OptionResultType extends Record<string, unknown> = {}
  > {
    positional<V>(
      name: string,
      type: ArgumentTypeExtended<symbol, V>,
      options?: PostionalArgumentOption
    ): CommandSchema<Push<V, PositionResultTypeReversed>, OptionResultType>;
    optional<K extends string, V>(
      k: K,
      type: ArgumentTypeExtended<symbol, V>,
      options?: OptionalValueArgumentOption<V>
    ): CommandSchema<PositionResultTypeReversed, OptionResultType & { K: V }>;
  }
}
