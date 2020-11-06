import yargs = require("yargs/yargs");
import { Arguments, Argv, Options, PositionalOptions } from "yargs";
import {
  CommandSchema,
  ArgumentType,
  OptionalValueArgumentOption,
  PostionalArgumentOption,
  ContextError,
} from "@guild-utils/command-schema";
export interface MainParserContext {
  guild?: string;
  user: string;
  channelType: "text" | "news" | "dm";
}
const aliasSymbol = Symbol("aliasSymbol");
export function buildYargsParser(
  schema: CommandSchema<unknown[], Record<string, unknown>>[],
  resolverOptional: (
    k: ArgumentType<symbol>,
    o: OptionalValueArgumentOption<unknown>
  ) => Options,
  resolverPositional: (
    k: ArgumentType<symbol>,
    o: PostionalArgumentOption
  ) => PositionalOptions,
  instance = yargs().help(false)
): Argv {
  return schema
    .reduce((a, e) => {
      const csr = [
        e.name,
        ...(e.subCommands.length !== 0 ? [`[subcommandargshandling..]`] : []),
        ...(e.subCommands.length !== 0
          ? []
          : e.positionalArgumentCollection.map(([name, , o]) =>
              o.variable
                ? `[${name}..]`
                : !o.optional
                ? `<${name}>`
                : `[${name}]`
            )),
      ].join(" ");
      console.log(csr);
      const r = a.command(csr, "");
      return r;
    }, instance)
    .default("default", {});
}
function isValidContext(
  schema: CommandSchema<unknown[], Record<string, unknown>>,
  ctx: MainParserContext
): boolean {
  return schema.options.runIn.has(ctx.channelType);
}
async function applySchema(
  schema: CommandSchema,
  optionResolver: (
    k: ArgumentType<symbol>,
    o: OptionalValueArgumentOption<unknown>,
    v: unknown,
    ctx: MainParserContext
  ) => Promise<unknown> | unknown,
  positionResolver: (
    k: ArgumentType<symbol>,
    o: PostionalArgumentOption,
    v: unknown,
    ctx: MainParserContext
  ) => Promise<unknown> | unknown,
  arr: string[],
  m: Record<string, unknown>,
  ctx: MainParserContext,
  commandString: string[]
): Promise<[string[], unknown[], Record<string, unknown>]> {
  const sschema = schema.subCommands.find(([k]) => {
    return k.name === arr[0];
  });
  if (sschema != null) {
    const ccmdString = arr.shift();
    const x = sschema[0];
    if (!ccmdString) {
      throw new TypeError();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    commandString.push(ccmdString);
    return applySchema(
      x,
      optionResolver,
      positionResolver,
      arr,
      m,
      ctx,
      commandString
    );
  }
  const positional = await Promise.all(
    schema.positionalArgumentCollection.map(async ([name, t, o], idx) => {
      if (o.variable) {
        return await positionResolver(t, o, m[name] ?? arr.slice(idx), ctx);
      }
      const v = m[name] ?? arr[idx];
      if (v == null) {
        return undefined;
      }
      if (name in m) {
        delete m[name];
      }
      return await positionResolver(t, o, v, ctx);
    })
  );
  const option = Object.fromEntries(
    await Promise.all(
      [...schema.optionArgumentCollection].map(
        async ([s, [t, o]]): Promise<[string, unknown]> => {
          const x = m[s];
          delete m[s];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const alias: unknown = o[aliasSymbol];
          if (alias === undefined) {
            // do nothing
          } else if (Array.isArray(alias)) {
            alias.forEach((e) =>
              typeof e === "string" && e in m ? delete m[e] : undefined
            );
          } else if (typeof alias === "string" && alias in m) {
            delete m[alias];
          }
          return [s, (await optionResolver(t, o, x, ctx)) ?? o.defaultValue];
        }
      )
    )
  );
  return [commandString, positional, option];
}
export type SpecialInfo = {
  isDefault: boolean;
};
export function buildMainParser(
  schemas: CommandSchema<unknown[], Record<string, unknown>>[],
  optionResolver: (
    k: ArgumentType<symbol>,
    o: OptionalValueArgumentOption<unknown>,
    v: unknown,
    ctx: MainParserContext
  ) => Promise<unknown> | unknown,
  positionResolver: (
    k: ArgumentType<symbol>,
    o: PostionalArgumentOption,
    v: unknown,
    ctx: MainParserContext
  ) => Promise<unknown> | unknown,
  yargsParser: Argv
): (
  content: string,
  ctx: MainParserContext
) => Promise<
  [string[], unknown[], Record<string, unknown>, SpecialInfo] | undefined
> {
  const commands = new Map(
    schemas.flatMap((e): [string, CommandSchema][] => [
      [e.name, e],
      ...(e.options.alias ?? []).map((k): [string, CommandSchema] => [k, e]),
    ])
  );
  return async (content: string, ctx: MainParserContext) => {
    const r: {
      _?: string[];
      $0: string;
      [k: string]: unknown;
    } = await new Promise<Arguments>((resolve, reject) =>
      yargsParser.parse(content, {}, (err, argv) =>
        err ? reject(err) : resolve(argv)
      )
    );
    const arr = r._;
    if (!arr) {
      return;
    }
    console.log(r);
    const initialCommandString = arr.shift();
    if (!initialCommandString) {
      return r["default"]
        ? [
            [],
            [],
            {},
            {
              isDefault: true,
            },
          ]
        : undefined;
    }
    delete (r as { $0?: string }).$0;
    delete r._;
    const schema = commands.get(initialCommandString);
    if (!schema) {
      return undefined;
    }
    if (!isValidContext(schema, ctx)) {
      throw new ContextError();
    }
    const [commandString, positional, option] = await applySchema(
      schema,
      optionResolver,
      positionResolver,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
      arr.concat((r as any)["subcommandargshandling"] ?? []),
      r,
      ctx,
      [initialCommandString]
    );
    console.log(positional);
    return [
      commandString,
      positional,
      option,
      {
        isDefault: false,
      },
    ];
  };
}
