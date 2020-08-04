import { KlasaClient } from "klasa";
import {
  GssGameEventRepository,
  GssCollectionGroupIdT,
  HKTGssCollectionName,
} from "repository_gss/game-event";
import { DependencyContainer } from "tsyringe";
import { GameEventUseCaseImpl } from "usecase_game-event";
import { GameEventNotificationRepositoryKlasa } from "repository_schedule";
import * as ENV from "./env";

export default function initGameEvent(
  container: DependencyContainer,
  gameEventNotificationRepository: GameEventNotificationRepositoryKlasa
): void {
  const GOOGLE_API_CREDENTIAL = ENV.GOOGLE_API_CREDENTIAL;
  if (GOOGLE_API_CREDENTIAL) {
    const usecase = new GameEventUseCaseImpl<
      GssGameEventRepository,
      GssCollectionGroupIdT,
      HKTGssCollectionName
    >(new GssGameEventRepository(JSON.parse(GOOGLE_API_CREDENTIAL)));
    container.register("GameEventUseCase", { useValue: usecase });
    container.register("GameEventNotificationRepository", {
      useValue: gameEventNotificationRepository,
    });
    KlasaClient.defaultGuildSchema.add("event", (f) => {
      f.add("sheet", "GoogleSpreadSheet");
      f.add("notificationChannel", "TextChannel");
      f.add("nextTaskId", "string", { configurable: false });
    });
    KlasaClient.defaultGuildSchema.add("momentLocale", "string", {
      default: "ja",
    });
    KlasaClient.defaultGuildSchema.add("momentTZ", "string", {
      default: "Asia/Tokyo",
    });
  } else {
    container.register("GameEventUseCase", { useValue: {} });
    container.register("GameEventNotificationRepository", {
      useValue: {},
    });
  }
}
