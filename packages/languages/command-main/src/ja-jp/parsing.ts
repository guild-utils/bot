import { DescriptionData } from "protocol_command-schema-core";
const parsingTextSummary = "解析するテキストを与えます。";
export const commandJumanpp: Record<"command" | "text", DescriptionData> = {
  command: {
    summary:
      "[jumanpp](https://github.com/ku-nlp/jumanpp#what-is-juman)で構文解析を行います。",
  },
  text: {
    summary: parsingTextSummary,
  },
};
export const commandKuromoji: Record<"command" | "text", DescriptionData> = {
  command: {
    summary:
      "[kuromoji](https://github.com/takuyaa/kuromoji.js#kuromojijs)で構文解析を行います。",
  },
  text: {
    summary: parsingTextSummary,
  },
};
