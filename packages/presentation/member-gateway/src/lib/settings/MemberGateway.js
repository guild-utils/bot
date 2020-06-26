const {Gateway,Settings}= require('klasa');
const { Collection } = require('discord.js');

/**
 * <danger>You should never create a Gateway instance by yourself.
 * Please check {@link UnderstandingSettingsGateway} about how to construct your own Gateway.</danger>
 * The Gateway class that manages the data input, parsing, and output, of an entire database, while keeping a cache system sync with the changes.
 * @extends GatewayStorage
 */
class MemberGateway extends Gateway {

	/**
	 * @since 0.0.1
	 * @param {GatewayDriver} store The GatewayDriver instance which initiated this instance
	 * @param {string} type The name of this Gateway
	 * @param {Schema} schema The schema for this gateway
	 * @param {string} provider The provider's name for this gateway
	 */
	constructor(store, type, schema, provider) {
		super(store, "members", schema, provider);
		this.idLength=37;
	}

	/**
	 * The Settings that this class should make.
	 * @since 0.5.0
	 * @type {Settings}
	 * @readonly
	 * @private
	 */
	get Settings() {
		return Settings;
	}

	/**
	 * Get an entry from the cache.
	 * @since 0.5.0
	 * @param {string} id The key to get from the cache
	 * @param {boolean} [create = false] Whether SG should create a new instance of Settings in the background, if the entry does not already exist.
	 * @returns {?Settings}
	 */
	get(id, create = false) {
		const [guildId,userId]=typeof id==="string"?id.split("."):id;
		const guild = this.client.guilds.resolve(guildId);
		const entry=guild.members.resolve(userId);
		if (entry) return entry.settings;
		if (create) {
			const settings = new this.Settings(this,{id:guildId+"."+userId});
			if (this._synced && this.schema.size) settings.sync(true).catch(err => this.client.emit('error', err));
			return settings;
		}
		return null;
	}

	/**
	 * Sync either all entries from the cache with the persistent database, or a single one.
	 * @since 0.0.1
	 * @param {(Array<string>|string)} [input=Array<string>] An object containing a id property, like discord.js objects, or a string
	 * @returns {?(Gateway|Settings)}
	 */
	async sync(input = [...[...this.client.guilds.cache.values()].flatMap(guild=>[...guild.members.cache.values()].map(member=>guild.id+"."+member.user.id))]) {
		if (Array.isArray(input)) {
			if (!this._synced) this._synced = true;
			const entries = await this.provider.getAll(this.type, input);
			console.log(entries);

			for (const entry of entries) {
				if (!entry) continue;
				const cache = this.get(entry.id);
				if (cache) {
					if (!cache._existsInDB) cache._existsInDB = true;
					cache._patch(entry);
				}
			}

			// Set all the remaining settings from unknown status in DB to not exists.
			for (const guild of this.client.guilds.cache.values()) {
				for( const entry of guild.members.cache.values()){
					if (entry.settings._existsInDB === null) entry.settings._existsInDB = false;
				}
			}
			return this;
		}

		const cache = this.get((input && input.id) || input);
		return cache ? cache.sync(true) : null;
	}

}

module.exports = MemberGateway;
