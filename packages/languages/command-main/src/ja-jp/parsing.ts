import { Context, DescriptionData } from "protocol_command-schema-core";
const parsingTextSummary = "解析するテキストを与えます。";
export const commandJumanpp: (
  ctx: Context
) => Record<"command" | "text", DescriptionData> = (ctx) => ({
  command: {
    summary:
      ctx.environment === "discord"
        ? "[jumanpp](https://github.com/ku-nlp/jumanpp#what-is-juman)で構文解析を行います。"
        : "kuromojiで構文解析を行います。",
  },
  text: {
    summary: parsingTextSummary,
  },
});
export const commandKuromoji: (
  ctx: Context
) => Record<"command" | "text", DescriptionData> = (ctx) => ({
  command: {
    summary:
      ctx.environment === "discord"
        ? "[kuromoji](https://github.com/takuyaa/kuromoji.js#kuromojijs)で構文解析を行います。"
        : "kuromojiで構文解析を行います。",
  },
  text: {
    summary: parsingTextSummary,
  },
});
