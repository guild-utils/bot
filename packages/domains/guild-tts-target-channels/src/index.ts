export interface TextToSpeechTargetChannelDataStore {
  getTextToSpeechTargetChannel(guild: string): Promise<Set<string>>;
  addTextToSpeechTargetChannel(guild: string, element: string): Promise<void>;
  removeTextToSpeechTargetChannel(
    guild: string,
    element: string
  ): Promise<void>;
  clearTextToSpeechTargetChannel(guild: string): Promise<void>;
}
