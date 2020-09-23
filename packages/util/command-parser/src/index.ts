import yargs = require("yargs/yargs");
import type { Arguments, Argv, Options, PositionalOptions } from "yargs";
import {
  CommandSchema,
  ArgumentType,
  OptionalValueArgumentOption,
  PostionalArgumentOption,
} from "command-schema";
export function buildParser(
  schema: CommandSchema<unknown[], Record<string, unknown>>[],
  resolver: (
    type: "option" | "positional",
    k: ArgumentType<symbol>,
    o: OptionalValueArgumentOption<unknown> | PostionalArgumentOption
  ) => { yargsOption?: Options; yargsPositionalOption?: PositionalOptions },
  instance = yargs()
): Argv {
  return schema.reduce((a, e) => {
    const r = a
      .command({
        command: [
          e.name,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ...e.positionalArgumentCollection.map(([name, _t, o]) =>
            o.variable
              ? `[...${name}]`
              : !o.optional
              ? `<${name}>`
              : `[${name}]`
          ),
        ].join(" "),
        builder: (builder) => {
          return buildParser(
            e.subCommands.map(([a]) => a),
            resolver,
            builder
          );
        },
        handler: (args: Arguments) => {
          console.log(args);
        },
      })
      .options(
        Object.fromEntries(
          [...e.optionArgumentCollection.entries()].map(([k, [v, o]]) => {
            return [k, resolver("option", v, o).yargsOption ?? {}];
          })
        )
      );
    const r2 = e.positionalArgumentCollection.reduce((a, [name, t, o]) => {
      return a.positional(
        name,
        resolver("positional", t, o).yargsPositionalOption ?? {}
      );
    }, r);
    return r2;
  }, instance);
}
