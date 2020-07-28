import { Structures, GuildMember, Guild, Client } from "discord.js";
import { Settings } from "klasa";
import "../settings/MemberGateway";

Structures.extend("GuildMember", (GuildMemberClazz: typeof GuildMember) => {
  /**
   * Klasa's Extended GuildMember
   * @extends external:GuildMember
   */
  return class KlasaMemberClazz extends GuildMemberClazz {
    settings: Settings;

    /**
     * @typedef {external:GuildMemberJSON} KlasaMemberJSON
     * @property {external:SettingsJSON} settings The per member settings
     */

    /**
     * @param {...*} args Normal D.JS GuildMember args
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(client: Client, data: Record<string, any>, guild: Guild) {
      super(client, data, guild);

      /**
       * The member level settings for this context (member || default)
       * @since 0.0.1
       * @type {external:Settings}
       */
      this.settings = this.client.gateways.members.get(
        [this.guild.id, this.user.id],
        true,
        guild
      );
    }

    /**
     * Returns the JSON-compatible object of this instance.
     * @since 0.5.0
     * @returns {KlasaMemberJSON}
     */
    toJSON() {
      return { ...super.toJSON(), settings: this.settings };
    }
  };
});
