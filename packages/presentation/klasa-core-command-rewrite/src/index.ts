import { CommandStore, Store, Piece, ArgumentStore } from "klasa";
import { join, extname, relative, sep } from "path";
import * as fs from "fs-nextra";
import { ColorResolvable } from "discord.js";
export { CommandEx } from "./commandEx";
import { CommandData } from "domain_command-data";
declare module "klasa" {
  interface KlasaClientOptions {
    themeColor?: ColorResolvable;
    allCommands: { [lang in string]: CommandData[] };
  }
}
async function loadFrom<K, V extends Piece, VConstructor>(
  store: Store<K, V, VConstructor>,
  directory: string
) {
  const files = await fs
    .scan(directory, {
      filter: (stats, path) => stats.isFile() && extname(path) === ".js",
    })
    .catch(() => {
      if (store.client.options.createPiecesFolders)
        fs.ensureDir(directory).catch((err) => store.client.emit("error", err));
    });
  if (!files) return [];
  return Promise.all(
    [...files.keys()].map((file) => {
      const cmd = store.load(directory, relative(directory, file).split(sep));
      return cmd;
    })
  );
}
export default async function register(
  arg: ArgumentStore,
  cmd: CommandStore
): Promise<void> {
  await loadFrom(arg, join(__dirname, "arguments"));
  await loadFrom(cmd, join(__dirname, "commands"));
}
