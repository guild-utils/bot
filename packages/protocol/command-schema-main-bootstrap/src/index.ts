import { schemaTextSupplier } from "protocol_command-schema-core-bootstrap";
import { CommandSchema } from "@guild-utils/command-schema";
import * as Schemas from "protocol_command-schema-main";
import * as SchemaJa from "languages_command-main/ja-jp";
import { DescriptionData } from "protocol_command-schema-core";
import type { Client } from "discord.js";
export type DictionaryCommands =
  | "dictionary"
  | "jumanpp"
  | "kuromoji"
  | "main-dictionary"
  | "before-dictionary"
  | "after-dictionary";
export type MainCommands = DictionaryCommands | "random";
export function defineMainCommandSchema(
  client: () => Client
): Record<MainCommands, CommandSchema> {
  return {
    dictionary: Schemas.commandDictionary(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandDictionary,
      })
    ),
    "after-dictionary": Schemas.commandSimpleDictionary(
      "after",
      schemaTextSupplier({
        ja_JP: SchemaJa.commandAfterDictionary,
      })
    ),
    "before-dictionary": Schemas.commandSimpleDictionary(
      "before",
      schemaTextSupplier({
        ja_JP: SchemaJa.commandBeforeDictionary,
      })
    ),
    "main-dictionary": Schemas.commandMainDictionary(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandMainDictionary,
      })
    ),
    jumanpp: Schemas.jumanpp(
      (lang, ctx): Record<"command" | "text", DescriptionData> => {
        const ja_JP = SchemaJa.commandJumanpp(ctx);
        const obj: Record<
          string,
          Record<"command" | "text", DescriptionData> | undefined
        > = {
          ja_JP,
        };
        return obj[lang] ?? ja_JP;
      }
    ),
    kuromoji: Schemas.kuromoji(
      (lang, ctx): Record<"command" | "text", DescriptionData> => {
        const ja_JP = SchemaJa.commandKuromoji(ctx);
        const obj: Record<
          string,
          Record<"command" | "text", DescriptionData> | undefined
        > = {
          ja_JP,
        };
        return obj[lang] ?? ja_JP;
      }
    ),
    random: Schemas.random(
      schemaTextSupplier({
        ja_JP: SchemaJa.commandRandom,
      }),
      client
    ),
  };
}
