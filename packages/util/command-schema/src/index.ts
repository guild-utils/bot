import { Push } from "boost-ts";
export const symbolOr = Symbol("or");
export interface ArgumentType<K extends symbol> {
  resolverKey: K;
  switchType: boolean;
}
class OrArgumentType implements ArgumentType<typeof symbolOr> {
  resolverKey: typeof symbolOr = symbolOr;
  switchType: false = false;
  constructor(
    public readonly a: ArgumentType<symbol>,
    public readonly b: ArgumentType<symbol>
  ) {}
}
export function or(
  a: ArgumentType<symbol>,
  b: ArgumentType<symbol>
): ArgumentType<typeof symbolOr> {
  return new OrArgumentType(a, b);
}
export interface OptionalValueArgumentOption<T> {
  defaultValue?: T;
}
export interface PostionalArgumentOption {
  optional?: boolean;
  variable?: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SubCommandOption {}
export class CommandSchema<
  PositionResultTypeReversed extends unknown[] = [],
  // eslint-disable-next-line @typescript-eslint/ban-types
  OptionResultType extends Record<string, unknown> = {}
> {
  constructor(
    public readonly name: string,
    public readonly positionalArgumentCollection: [
      string,
      ArgumentType<symbol>,
      PostionalArgumentOption
    ][] = [],
    public readonly optionArgumentCollection: Map<
      string,
      [ArgumentType<symbol>, OptionalValueArgumentOption<unknown>]
    > = new Map<
      string,
      [ArgumentType<symbol>, OptionalValueArgumentOption<unknown>]
    >(),
    public readonly subCommands: [CommandSchema, SubCommandOption][] = []
  ) {}
  positional<V>(
    name: string,
    type: ArgumentType<symbol>,
    options?: PostionalArgumentOption
  ): CommandSchema<Push<V, PositionResultTypeReversed>, OptionResultType> {
    const v: [string, ArgumentType<symbol>, PostionalArgumentOption] = [
      name,
      type,
      options ?? {},
    ];
    return new CommandSchema(
      this.name,
      [...this.positionalArgumentCollection, v],
      this.optionArgumentCollection,
      this.subCommands
    );
  }
  optional<K extends string, V>(
    k: K,
    type: ArgumentType<symbol>,
    options?: OptionalValueArgumentOption<V>
  ): CommandSchema<PositionResultTypeReversed, OptionResultType & { K: V }> {
    return new CommandSchema(
      this.name,
      this.positionalArgumentCollection,
      new Map([...this.optionArgumentCollection, [k, [type, options ?? {}]]]),
      this.subCommands
    );
  }
  command(
    command: CommandSchema,
    options?: SubCommandOption
  ): CommandSchema<PositionResultTypeReversed, OptionResultType> {
    const ne: [CommandSchema, SubCommandOption] = [command, options ?? {}];
    return new CommandSchema(
      this.name,
      this.positionalArgumentCollection,
      this.optionArgumentCollection,
      [...this.subCommands, ne]
    );
  }
}
