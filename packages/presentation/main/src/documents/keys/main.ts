import { ColorResolvable } from "discord.js";
import { VoiceKindArray } from "domain_meta";
import {
  commandTextSupplier,
  HelpCommandCotext,
  KeyInfoRecord,
} from "presentation_core";
import { createEmbedWithMetaData } from "protocol_util-djs";

function entry(
  k: string,
  v: string,
  summary: string,
  desc = summary
): (color: ColorResolvable, defaultPrefix: string) => KeyInfoRecord[string] {
  return (color, defaultPrefix) => {
    return {
      embed: commandTextSupplier({
        ja_JP: (ctx: HelpCommandCotext) => {
          return createEmbedWithMetaData({
            color,
            ...ctx.executor,
          })
            .setTitle(k)
            .setDescription(`${desc}\nこの設定はレイヤー構造となっています。`)
            .addField(
              "set",
              `${k}値の設定を行います。\n以下の例では${v}に設定しています。\n` +
                `${ctx.prefix ?? defaultPrefix}set ${k} ${v}`
            )
            .addField(
              "get",
              `${k}値の確認を行います。\n` +
                `${ctx.prefix ?? defaultPrefix}get ${k}`
            )
            .addField(
              "reset",
              `${k}値をデフォルトに戻します。\n` +
                `${ctx.prefix ?? defaultPrefix}reset ${k}`
            );
        },
      }),
      summary: commandTextSupplier({
        ja_JP: (ctx: HelpCommandCotext) => {
          return `${desc}\n${
            ctx.prefix ?? defaultPrefix
          }help keys ${k}で詳細を確認できます。`;
        },
      }),
      aliases: [`speech.${k}`],
    };
  };
}
function randomizer(
  color: ColorResolvable,
  defaultPrefix: string
): KeyInfoRecord[string] {
  const k = "randomizer";
  const v = "v2";
  return {
    embed: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return createEmbedWithMetaData({
          color,
          ...ctx.executor,
        })
          .setTitle(k)
          .setDescription(
            `読み上げ音声のシャッフルに関する設定です。\nこの設定はサーバー設定も含むレイヤー構造となっています。\nv1は値がすべて固定となります。\nv2ではユーザーidを元にランダムに設定します。`
          )
          .addField(
            "set",
            `${k}の設定を行います。\n以下の例では${v}に設定しています。\n` +
              `${ctx.prefix ?? defaultPrefix}set ${k} ${v}`
          )
          .addField(
            "get",
            `${k}の確認を行います。\n` +
              `${ctx.prefix ?? defaultPrefix}get ${k}`
          )
          .addField(
            "reset",
            `${k}をデフォルトに戻します。\n` +
              `${ctx.prefix ?? defaultPrefix}reset ${k}`
          );
      },
    }),
    summary: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return `読み上げ音声のシャッフルに関する設定です。\n${
          ctx.prefix ?? defaultPrefix
        }help keys ${k}で詳細を確認できます。`;
      },
    }),
    aliases: [`speech.${k}`],
  };
}
function maxVolume(
  color: ColorResolvable,
  defaultPrefix: string
): KeyInfoRecord[string] {
  const k = "maxVolume";
  const v = "2.0";
  return {
    embed: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return createEmbedWithMetaData({
          color,
          ...ctx.executor,
        })
          .setTitle(k)
          .setDescription(
            `読み上げ音声の最大音量に関する設定です。\nこの設定はサーバー設定です。`
          )
          .addField(
            "set",
            `${k}の設定を行います。\n以下の例では${v}に設定しています。\n` +
              `${ctx.prefix ?? defaultPrefix}set ${k} ${v}`
          )
          .addField(
            "get",
            `${k}の確認を行います。\n` +
              `${ctx.prefix ?? defaultPrefix}get ${k}`
          )
          .addField(
            "reset",
            `${k}をデフォルトに戻します。\n` +
              `${ctx.prefix ?? defaultPrefix}reset ${k}`
          );
      },
    }),
    summary: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return `読み上げ音声の最大音量に関する設定です。\n${
          ctx.prefix ?? defaultPrefix
        }help keys ${k}で詳細を確認できます。`;
      },
    }),
    aliases: [`speech.${k}`],
  };
}
function maxReadLimit(
  color: ColorResolvable,
  defaultPrefix: string
): KeyInfoRecord[string] {
  const k = "maxReadLimit";
  const v = "30";
  return {
    embed: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return createEmbedWithMetaData({
          color,
          ...ctx.executor,
        })
          .setTitle(k)
          .setDescription(
            `読み上げをどこで打ち切るかの設定です。\nこの設定はサーバー設定です。`
          )
          .addField(
            "set",
            `${k}の設定を行います。\n以下の例では${v}に設定しています。\n` +
              `${ctx.prefix ?? defaultPrefix}set ${k} ${v}`
          )
          .addField(
            "get",
            `${k}の確認を行います。\n` +
              `${ctx.prefix ?? defaultPrefix}get ${k}`
          )
          .addField(
            "reset",
            `${k}をデフォルトに戻します。\n` +
              `${ctx.prefix ?? defaultPrefix}reset ${k}`
          );
      },
    }),
    summary: commandTextSupplier({
      ja_JP: (ctx: HelpCommandCotext) => {
        return `読み上げをどこで打ち切るかの設定です。\n${
          ctx.prefix ?? defaultPrefix
        }help keys ${k}で詳細を確認できます。`;
      },
    }),
    aliases: [`speech.${k}`],
  };
}
const isLayered = "この設定はレイヤー構造となっています。";
export function mainKeys(
  color: ColorResolvable,
  defaultPrefix: string
): KeyInfoRecord<string> {
  return {
    allpass: entry(
      "allpass",
      "0.45",
      "読み上げのallpass値の設定です。",
      "読み上げのallpass値の設定です。\n" + isLayered
    )(color, defaultPrefix),
    intone: entry(
      "intone",
      "0.45",
      "読み上げのイントネーションに関する設定です。",
      "読み上げのイントネーションに関する設定です。\n" + isLayered
    )(color, defaultPrefix),
    kind: entry(
      "kind",
      "neutral",
      "読み上げる声の設定です。",
      "読み上げる声の設定です。\n" +
        isLayered +
        "\n以下のものが利用できます。\n" +
        VoiceKindArray.join("\n")
    )(color, defaultPrefix),
    readName: entry(
      "readName",
      "にゃー",
      "ニックネームとメンションをどのように読み上げるかの設定です。",
      "ニックネームとメンションをどのように読み上げるかの設定です。\n" +
        isLayered
    )(color, defaultPrefix),
    speed: entry(
      "speed",
      "2",
      "読み上げ速度に関する設定です。",
      "読み上げ速度に関する設定です。\n" + isLayered
    )(color, defaultPrefix),
    tone: entry(
      "tone",
      "2",
      "読み上げ音声の高さに関する設定です。",
      "読み上げ音声の高さに関する設定です。\n" + isLayered
    )(color, defaultPrefix),
    threshold: entry(
      "threshold",
      "0.9",
      "読み上げのthreshold値の設定です。",
      "読み上げのthreshold値の設定です。\n" + isLayered
    )(color, defaultPrefix),
    volume: entry(
      "volume",
      "0.9",
      "読み上げ音声の大きさの設定です。",
      "読み上げ音声の大きさの設定です。\n" +
        "サーバーのmaxVolume以上に設定しても丸められます。\n" +
        isLayered
    )(color, defaultPrefix),
    randomizer: randomizer(color, defaultPrefix),
    maxVolume: maxVolume(color, defaultPrefix),
    maxReadLimit: maxReadLimit(color, defaultPrefix),
  };
}
