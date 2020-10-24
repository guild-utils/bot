import {
  ArgumentType,
  CommandSchema,
  OptionalValueArgumentOption,
} from "@guild-utils/command-schema";
import { ColorResolvable } from "discord.js";
import { Context, DescriptionData } from "protocol_command-schema-core";
import { createEmbedWithMetaData } from "protocol_util-djs";
import {
  Category,
  Command,
  HelpCommandCotext,
  HelpEntry,
} from "../commands-v2/info/help";
import * as RtlJa from "../languages/ja-jp";
import { commandTextSupplier, CoreCommands } from "./commands";
export function usageFromSchemaBody(schema: CommandSchema): string {
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
export function usageFromSchema(schema: CommandSchema, prefix: string): string {
  const subcommandsUsage = schema.subCommands.map(
    ([s]) => `${prefix}${schema.name} ${usageFromSchemaBody(s)}`
  );
  const args = usageFromSchemaBody(schema);
  const entire = `${prefix}${args}`;
  return [entire, ...subcommandsUsage].join("\n");
}
export type CommandFromSchemaCtx = {
  defaultPrefix: string;
  color: ColorResolvable;
};
export function aliasString(schema: CommandSchema): string {
  const alias = schema.options.alias;
  if (!alias) {
    return "";
  }
  return `(${alias.join(",")})`;
}
export function commandFromSchema(
  schema: CommandSchema,
  category: string,
  gctx: CommandFromSchemaCtx
): Command {
  const desc = (lang: string) => (ctx: HelpCommandCotext) =>
    schema.options.descriptionResolver(lang, {
      enviromnet: "discord",
      runningCommand: ctx.runningCommand,
      defaultPrefix: gctx.defaultPrefix,
      prefix: ctx.prefix,
    });
  return {
    type: "command",
    value: schema,
    summary: (lang) => (ctx) => desc(lang)(ctx).summary ?? "",
    embed: (lang) => (ctx) => {
      const ggctx: Context = {
        defaultPrefix: gctx.defaultPrefix,
        enviromnet: "discord",
        prefix: ctx.prefix,
        runningCommand: ctx.runningCommand,
      };
      const dr = desc(lang)(ctx);
      return createEmbedWithMetaData({
        color: gctx.color,
        ...ctx.executor,
      })
        .setTitle(schema.name + aliasString(schema))
        .setDescription(dr.description ?? dr.summary)
        .addField(
          "Usage",
          usageFromSchema(schema, ctx.prefix ?? gctx.defaultPrefix)
        )
        .addFields(
          schema.subCommands.map(([s]) => {
            return {
              name: s.name,
              value: s.options.descriptionResolver(lang, ggctx).summary,
            };
          })
        )
        .addFields(
          [
            ...schema.positionalArgumentCollection,
            ...[...schema.optionArgumentCollection].map(([k, e]): [
              string,
              ArgumentType<symbol>,
              OptionalValueArgumentOption<unknown>
            ] => [k, e[0], e[1]]),
          ]
            .map((e): [string, DescriptionData] => [
              e[0],
              e[2].descriptionResolver(lang, ggctx),
            ])
            .filter(([, e]) => !e.undocumented)
            .map(([k, e]) => ({
              name: k,
              value: e.summary,
            }))
        )
        .addField("Category", category, true);
    },
  };
}
export function commandsToMapWithNameAndAlias(
  schemas: Command[]
): Map<string, HelpEntry> {
  return new Map(
    schemas.flatMap((e): [string, Command][] => [
      [e.value.name, e],
      ...(e.value.options.alias ?? []).map((k): [string, Command] => [k, e]),
    ])
  );
}
export function commandsToMapWithName(
  schemas: Command[]
): [Map<string, HelpEntry>, Map<string, HelpEntry>] {
  return [
    new Map(schemas.map((e) => [e.value.name + aliasString(e.value), e])),
    new Map(schemas.map((e) => [e.value.name, e])),
  ];
}
export function categorysToMap(
  categorys: [string, Category][]
): Map<string, HelpEntry> {
  return new Map(categorys);
}
export function rootCategory(
  color: ColorResolvable,
  resolverValue: Map<string, HelpEntry>,
  visualValueDesc: Map<string, HelpEntry>
): Category {
  const embed = commandTextSupplier({
    ja_JP: RtlJa.categoryRootEmbed(color, visualValueDesc),
  });
  const summary = commandTextSupplier({
    ja_JP: RtlJa.categoryRootDescription(),
  });
  return {
    type: "category",
    name: () => "Help",
    embed,
    summary,
    resolverValue,
  };
}
export function infoCategory(
  color: ColorResolvable,
  resolverValue: Map<string, HelpEntry>,
  visualValueDesc: Map<string, HelpEntry>,
  visualValueSummary: Map<string, HelpEntry>
): Category {
  const embed = commandTextSupplier({
    ja_JP: RtlJa.categoryInfoEmbed(color, visualValueDesc),
  });
  const summary = commandTextSupplier({
    ja_JP: RtlJa.categoryInfoDescription(visualValueSummary),
  });
  return {
    type: "category",
    name: () => "Info",
    embed,
    summary,
    resolverValue,
  };
}
export function configurateCategory(
  color: ColorResolvable,
  resolverValue: Map<string, HelpEntry>,
  visualValueDesc: Map<string, HelpEntry>,
  visualValueSummary: Map<string, HelpEntry>
): Category {
  const embed = commandTextSupplier({
    ja_JP: RtlJa.categoryConfigurateEmbed(color, visualValueDesc),
  });
  const summary = commandTextSupplier({
    ja_JP: RtlJa.categoryConfigurateDescription(visualValueSummary),
  });
  return {
    type: "category",
    name: () => "Configurate",
    embed,
    summary,
    resolverValue,
  };
}

export function configureCategoryValue(
  record: Record<CoreCommands, CommandSchema>,
  ctx: CommandFromSchemaCtx
): Command[] {
  return [
    record.add,
    record.get,
    record.remove,
    record.reset,
    record.set,
  ].map((e) => commandFromSchema(e, "Configurate", ctx));
}
export function infoCategoryValue(
  record: Record<CoreCommands, CommandSchema>,
  ctx: CommandFromSchemaCtx
): Command[] {
  return [
    record.help,
    record.invite,
    record.ping,
    record.stats,
    record.info,
  ].map((e) => commandFromSchema(e, "Info", ctx));
}
export function voiceCategory(
  color: ColorResolvable,
  resolverValue: Map<string, HelpEntry>,
  visualValueDesc: Map<string, HelpEntry>,
  visualValueSummary: Map<string, HelpEntry>
): Category {
  const embed = commandTextSupplier({
    ja_JP: RtlJa.categoryVoiceEmbed(color, visualValueDesc),
  });
  const summary = commandTextSupplier({
    ja_JP: RtlJa.categoryVoiceDescription(visualValueSummary),
  });
  return {
    type: "category",
    name: () => "Voice",
    embed,
    summary,
    resolverValue,
  };
}
export function voiceCategoryValue(
  record: Record<CoreCommands, CommandSchema>,
  ctx: CommandFromSchemaCtx
): Command[] {
  return [
    record["applied-voice-config"],
    record["end-channel"],
    record.end,
    record.skip,
    record.start,
  ].map((e) => commandFromSchema(e, "Voice", ctx));
}
