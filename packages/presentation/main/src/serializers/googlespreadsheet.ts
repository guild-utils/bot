/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Serializer,
  SerializerStore,
  SerializerOptions,
  SchemaPiece,
  Language,
  KlasaGuild,
} from "klasa";
import * as LANG_KEYS from "../lang_keys";
import { URL } from "url";
export default class GoogleSpreadSheet extends Serializer {
  constructor(
    store: SerializerStore,
    file: string[],
    directory: string,
    options?: SerializerOptions
  ) {
    super(store, file, directory, options);
  }
  private regexp = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public serialize(data: any): string | number | boolean {
    if (typeof data === "string") {
      const arr = data.match(this.regexp);
      if (arr === null) {
        return data;
      }
      if (arr && arr[1]) {
        return arr[1];
      }
      throw this.client.languages.get(
        LANG_KEYS.INVALID_GOOGLE_SPREAD_SHEET_FORMAT
      );
    }
    if (data instanceof URL) {
      return this.serialize(data.toString());
    }
    throw this.client.languages.get(
      LANG_KEYS.INVALID_GOOGLE_SPREAD_SHEET_FORMAT
    );
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public stringify(data: any): string {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return `https://docs.google.com/spreadsheets/d/${data}`;
  }
  public deserialize(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    data: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _piece: SchemaPiece,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _language: Language,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _guild?: KlasaGuild
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }
}
