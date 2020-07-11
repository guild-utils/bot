import { LanguageStore, LanguageOptions } from "klasa";
import CoreLanguage from "presentation_core/languages/ja-JP";
export default class extends CoreLanguage {
  constructor(
    store: LanguageStore,
    file: string[],
    directory: string,
    options?: LanguageOptions
  ) {
    super(store, file, directory, options);

    this.language = { ...this.KLASA_MESSAGES, ...this.CORE_MESSAGES };
  }
}
