module.exports = class Finalizer {

	constructor(client, dir, file, name, { enabled = true }) {
		this.client = client;
		this.dir = dir;
		this.file = file;
		this.name = name;
		this.type = 'finalizer';
		this.enabled = enabled;
	}

	async reload() {
		const fin = this.client.finalizers.load(this.dir, this.file);
		await fin.init();
		return fin;
	}

	unload() {
		return this.client.finalizers.delete(this);
	}

	disable() {
		this.enabled = false;
		return this;
	}

	enable() {
		this.enabled = true;
		return this;
	}

	run() {
		// Defined in extension Classes
	}

	init() {
		// Optionally defined in extension Classes
	}

};
