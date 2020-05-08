import { KlasaClientOptions } from 'klasa';

export const config: KlasaClientOptions = {
    gateways:{
        guilds:{
            provider:"json",
        }
    },
    consoleEvents: {
		debug: false,
		error: true,
		log: true,
		verbose: false,
		warn: true,
		wtf: true
    },
    providers:{default:"json"},
	/**
	 * Console Options
	 */
	console: {
		// Alternatively a Moment Timestamp string can be provided to customize the timestamps.
		timestamps: true,
		utc: false,
		colors: {
			debug: { time: { background: 'magenta' } },
			error: { time: { background: 'red' } },
			log: { time: { background: 'blue' } },
			verbose: { time: { text: 'gray' } },
			warn: { time: { background: 'lightyellow', text: 'black' } },
			wtf: { message: { text: 'red' }, time: { background: 'red' } }
		}
	},
	language:"ja_JP",
	prefix:"$",
	production:process.env.NODE_ENV === 'production'
}


export const token: string =process.env["PWRD_EVENT_DISCORD_TOKEN"]!;
