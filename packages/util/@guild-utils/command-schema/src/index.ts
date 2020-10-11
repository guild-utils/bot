import { Push } from "boost-ts";
export const symbolOr = Symbol("or");
export interface ArgumentType<K extends symbol> {
  resolverKey: K;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OptionBase {}
export interface OptionalValueArgumentOption<T> extends OptionBase {
  defaultValue?: T;
  alias?: undefined | string[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CommandOption extends OptionBase {
  alias?: undefined | string[];
  runIn: Set<"text" | "news" | "dm">;
}
export interface PostionalArgumentOption extends OptionBase {
  optional?: boolean;
  variable?: boolean;
}
export class ContextError extends TypeError {
  constructor() {
    super(
      "Do not execute in this context. Please use on the server and select server context or none."
    );
  }
}

export class PermissionError extends TypeError {
  constructor() {
    super("Command failed. Permission error.");
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SubCommandOption extends OptionBase {}
export class CommandSchema<
  PositionResultTypeReversed extends unknown[] = [],
  // eslint-disable-next-line @typescript-eslint/ban-types
  OptionResultType extends Record<string, unknown> = {}
> {
  constructor(
    public readonly name: string,
    public readonly options: CommandOption,
    public readonly positionalArgumentCollection: [
      string,
      ArgumentType<symbol>,
      PostionalArgumentOption
    ][] = [],
    public readonly denyRequiredPosisitonalArgument = false,
    public readonly denyAdditionalPositionalArgument = false,
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
    options: PostionalArgumentOption = {}
  ): CommandSchema<Push<V, PositionResultTypeReversed>, OptionResultType> {
    if (this.denyAdditionalPositionalArgument) {
      throw new TypeError("deny the additional positional argument.");
    }
    if (this.denyRequiredPosisitonalArgument && !options.optional) {
      throw new TypeError("deny the additional required positional argument.");
    }
    const v: [string, ArgumentType<symbol>, PostionalArgumentOption] = [
      name,
      type,
      options,
    ];

    return new CommandSchema(
      this.name,
      this.options,
      [...this.positionalArgumentCollection, v],
      options.optional,
      options.variable,
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
      this.options,
      this.positionalArgumentCollection,
      this.denyRequiredPosisitonalArgument,
      this.denyAdditionalPositionalArgument,
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
      this.options,
      this.positionalArgumentCollection,
      this.denyRequiredPosisitonalArgument,
      this.denyAdditionalPositionalArgument,
      this.optionArgumentCollection,
      [...this.subCommands, ne]
    );
  }
}
