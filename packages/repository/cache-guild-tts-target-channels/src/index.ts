import { TextToSpeechTargetChannelDataStore } from "domain_guild-tts-target-channels";

export class CacheTextToSpeechTargetChannelDataStore
  implements TextToSpeechTargetChannelDataStore {
  constructor(private readonly upstream: TextToSpeechTargetChannelDataStore) {}
  private cache = new Map<string, Set<string>>();
  async getTextToSpeechTargetChannel(guild: string): Promise<Set<string>> {
    const v = this.cache.get(guild);
    if (v != null) {
      return v;
    }
    const r = await this.upstream.getTextToSpeechTargetChannel(guild);
    this.cache.set(guild, r ?? new Set<string>());
    return r;
  }
  async addTextToSpeechTargetChannel(
    guild: string,
    element: string
  ): Promise<void> {
    await this.upstream.addTextToSpeechTargetChannel(guild, element);
    const v = this.cache.get(guild);
    if (v != null) {
      v.add(element);
    } else {
      this.cache.set(guild, new Set([element]));
    }
  }
  async removeTextToSpeechTargetChannel(
    guild: string,
    element: string
  ): Promise<void> {
    await this.upstream.removeTextToSpeechTargetChannel(guild, element);
    const v = this.cache.get(guild);
    if (v != null) {
      v.delete(element);
      if (!v.size) {
        v.delete(guild);
      }
    } else {
      throw new TypeError("invalid state");
    }
  }
  async clearTextToSpeechTargetChannel(guild: string): Promise<void> {
    await this.upstream.clearTextToSpeechTargetChannel(guild);
    this.cache.delete(guild);
  }
}
