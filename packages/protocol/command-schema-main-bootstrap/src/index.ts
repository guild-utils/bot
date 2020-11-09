import { schemaTextSupplier } from "protocol_command-schema-core-bootstrap";
import { CommandSchema } from "@guild-utils/command-schema";
import * as Schemas from "protocol_command-schema-main";
import * as SchemaJa from "languages_command-main/ja-jp";
export type MainCommands =
  | "dictionary"
  | "jumanpp"
  | "kuromoji"
  | "main-dictionary"
  | "before-dictionary"
  | "after-dictionary";
export function defineMainCommandSchema(): Record<MainCommands, CommandSchema> {
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
    jumanpp: Schemas.jumanpp((lang, ctx) => {
      return SchemaJa.commandJumanpp(ctx);
    }),
    kuromoji: Schemas.kuromoji((lang, ctx) => {
      return SchemaJa.commandKuromoji(ctx);
    }),
  };
}
