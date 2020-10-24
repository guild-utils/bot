/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";
import { Collection } from "mongodb";
export type MongoTextToSpeechTargetChannelDataStoreCollectionType = {
  speech: {
    targets: string[];
  };
};
export class MongoTextToSpeechTargetChannelDataStore
  implements TextToSpeechTargetChannelDataStore {
  constructor(
    private readonly collection: Collection<
      MongoTextToSpeechTargetChannelDataStoreCollectionType
    >
  ) {}
  async getTextToSpeechTargetChannel(guild: string): Promise<Set<string>> {
    const r = await this.collection.findOne(
      { id: guild },
      {
        projection: {
          speech: {
            targets: 1,
          },
        },
      }
    );
    return new Set(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ((r?.speech as any)?.targets as string[] | undefined | null) ?? []
    );
  }
  async addTextToSpeechTargetChannel(
    guild: string,
    element: string
  ): Promise<void> {
    await this.collection.updateOne(
      { id: guild },
      {
        $addToSet: {
          "speech.targets": element,
        },
      },
      {
        upsert: true,
      }
    );
  }
  async removeTextToSpeechTargetChannel(
    guild: string,
    element: string
  ): Promise<void> {
    await this.collection.updateOne(
      { id: guild },
      {
        $pull: {
          "speech.targets": element,
        },
      },
      {
        upsert: true,
      }
    );
  }
  async clearTextToSpeechTargetChannel(guild: string): Promise<void> {
    await this.collection.updateOne(
      { id: guild },
      {
        $unset: {
          "speech.targets": 1,
        },
      },
      {
        upsert: true,
      }
    );
  }
}
