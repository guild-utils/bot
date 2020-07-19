import { KlasaClient } from "klasa";

export default function initStartBoard(): void {
  KlasaClient.defaultGuildSchema.add("starBoard", "TextChannel");
}
