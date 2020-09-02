const { Inhibitor } = require('klasa');

module.exports = class extends Inhibitor {

	run(message, command) {
		if (!command.enabled) throw message.language.get('INHIBITOR_DISABLED_GLOBAL');
		const set = this.client.options.guildConfigRepository.getDisabledCommands(message);
		if (set.has(command.name)) throw message.language.get('INHIBITOR_DISABLED_GUILD');
	}

};
