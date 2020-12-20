import { CommandSchema } from "@guild-utils/command-schema";

export function usageFromSchema(schema: CommandSchema, prefix: string): string {
  return usageEntrysFromSchema(schema, prefix).join("\n");
}
export function usageEntrysFromSchema(
  schema: CommandSchema,
  prefix: string
): string[] {
  const subcommandsUsage = schema.subCommands.map(([s]) =>
    usageEntryFromSchema2(schema, s, prefix)
  );
  if (schema.needSubCommands) {
    return [...subcommandsUsage];
  }
  const args = usageBodyFromSchema(schema);
  const entire = `${prefix}${args}`;
  return [entire, ...subcommandsUsage];
}
export function usageEntryFromSchema2(
  schema: CommandSchema,
  sub: CommandSchema,
  prefix: string
): string {
  return `${prefix}${schema.name} ${usageBodyFromSchema(sub)}`;
}
export function usageBodyFromSchema(schema: CommandSchema): string {
  const args = schema.positionalArgumentCollection
    .map(([name, typ, opt]) => {
      if (opt.variable) {
        return `[...${name}]:${typ.name}`;
      }
      if (opt.optional) {
        return `(${name}):${typ.name}`;
      } else {
        return `<${name}>:${typ.name}`;
      }
    })
    .join(" ");
  return `${schema.name}${args.length === 0 ? "" : " " + args}`;
}
