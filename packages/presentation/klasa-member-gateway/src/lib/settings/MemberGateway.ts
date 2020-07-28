/* eslint-disable */

import { Gateway, Settings, GatewayDriver, Schema } from "klasa";
import { Guild } from "discord.js";
import "../extensions/KlasaMember";

/**
 * <danger>You should never create a Gateway instance by yourself.
 * Please check {@link UnderstandingSettingsGateway} about how to construct your own Gateway.</danger>
 * The Gateway class that manages the data input, parsing, and output, of an entire database, while keeping a cache system sync with the changes.
 * @extends GatewayStorage
 */
export default class MemberGateway extends Gateway {
  _synced!: boolean;
  idLength: number;

  /**
   * @since 0.0.1
   * @param {GatewayDriver} store The GatewayDriver instance which initiated this instance
   * @param {string} type The name of this Gateway
   * @param {Schema} schema The schema for this gateway
   * @param {string} provider The provider's name for this gateway
   */
  constructor(
    store: GatewayDriver,
    type: string,
    schema: Schema,
    provider: string
  ) {
    super(store, "members", schema, provider);
    this.idLength = 37;
  }
  get(id: string[], create?: boolean, makingGuild?: Guild): Settings;
  get(id: string, create?: boolean, makingGuild?: Guild): Settings;
  get(id: string | string[], create = false, makingGuild?: Guild): Settings {
    const [guildId, userId] = typeof id === "string" ? id.split(".") : id;
    const guild = makingGuild ?? this.client.guilds.resolve(guildId);
    if (!guild) {
      throw new Error("Guild is NULL");
    }
    const entry = guild.members.resolve(userId);
    if (entry) return entry.settings;
    if (create) {
      const settings = new Settings(this, { id: guildId + "." + userId });
      if (this._synced && this.schema?.size)
        settings.sync(true).catch((err) => this.client.emit("error", err));
      return settings;
    }
    throw new TypeError("Illegal State!Settings#get");
  }

  /**
   * Sync either all entries from the cache with the persistent database, or a single one.
   * @since 0.0.1
   * @param {(Array<string>|string)} [input=Array<string>] An object containing a id property, like discord.js objects, or a string
   * @returns {?(Gateway|Settings)}
   */
  public sync(input: string): Promise<Settings>;
  public sync(input?: string[]): Promise<Gateway>;
  async sync(
    input: string[] | string = [
      ...[...this.client.guilds.cache.values()].flatMap((guild) =>
        [...guild.members.cache.values()].map(
          (member) => guild.id + "." + member.user.id
        )
      ),
    ]
  ): Promise<Gateway | Settings> {
    if (Array.isArray(input)) {
      if (!this._synced) this._synced = true;
      const entries = await (this.provider?.getAll as any)(this.type, input);

      for (const entry of entries) {
        if (!entry) continue;
        const cache: any = this.get(entry.id);
        if (cache) {
          if (!cache._existsInDB) cache._existsInDB = true;
          cache._patch(entry);
        }
      }

      // Set all the remaining settings from unknown status in DB to not exists.
      for (const guild of this.client.guilds.cache.values()) {
        for (const entry of guild.members.cache.values()) {
          if ((entry.settings as any)._existsInDB === null)
            (entry.settings as any)._existsInDB = false;
        }
      }
      return this;
    }

    const cache = this.get(input);
    return cache.sync(true);
  }
}
