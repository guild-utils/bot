/* eslint-disable */

import { Structures } from "discord.js";

Structures.extend("Guild", (Guild) => {
  /**
   * Mutates KlasaGuild to include a KlasaMemberStore with our extensions
   * @extends external:Guild
   */
  return class extends Guild {
    constructor(client, data) {
      // avoid double iteration by the super class populating the members collection
      const { members, ...restData } = data || {};
      super(client, Object.keys(restData).length ? restData : undefined);
    }
  };
});
