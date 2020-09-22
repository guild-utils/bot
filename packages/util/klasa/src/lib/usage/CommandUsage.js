const Usage = require('./Usage');
const CommandPrompt = require('./CommandPrompt');

/**
 * Converts usage strings into objects to compare against later
 * @extends Usage
 */
class CommandUsage extends Usage {

	/**
	 * @since 0.0.1
	 * @param {KlasaClient} client The klasa client
	 * @param {usageString} usageString The usage string for this command
	 * @param {usageDelim} usageDelim The usage deliminator for this command
	 * @param {Command} command The command this parsed usage is for
	 */
	constructor(client, usageString, usageDelim, command) {
		super(client, usageString, usageDelim);

		/**
		 * All names and aliases for the command
		 * @since 0.0.1
		 * @type {string[]}
		 */
		this.names = [command.name, ...command.aliases];

		/**
		 * The compiled string for all names/aliases in a usage string
		 * @since 0.0.1
		 * @type {string}
		 */
		this.commands = this.names.length === 1 ? this.names[0] : `《${this.names.join('|')}》`;

		/**
		 * The concatenated string of this.commands and this.deliminatedUsage
		 * @since 0.0.1
		 * @type {string}
		 */
		this.nearlyFullUsage = `${this.commands}${this.deliminatedUsage}`;
	}

	/**
	 * Creates a CommandPrompt instance to collect and resolve arguments with
	 * @since 0.5.0
	 * @param {KlasaMessage} message The message context from the prompt
	 * @param {TextPromptOptions} [options={}] The options for the prompt
	 * @returns {CommandPrompt}
	 */
	createPrompt(message, options = {}) {
		return new CommandPrompt(message, this, options);
	}


	/**
	 * Defines to string behavior of this class.
	 * @since 0.5.0
	 * @returns {string}
	 */
	toString() {
		return this.nearlyFullUsage;
	}

}

module.exports = CommandUsage;
