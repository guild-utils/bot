import { KlasaClientOptions } from 'klasa';

export const config: KlasaClientOptions = {
    gateways:{
        guilds:{
            provider:process.env["PWRD_EVENT_PROVIDER"],
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
    providers:{
		default:process.env["PWRD_EVENT_PROVIDER"],
		postgresql:{
			host: process.env["POSTGRESS_HOST"],
			port: process.env["POSTGRESS_PORT"],
			database: process.env["POSTGRESS_DATABASE"],
			user: process.env["POSTGRESS_USER"],
			password:  process.env["POSTGRESS_PASSWORD"],
			options: {
				max: 20,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 2000
			}
		}
	},
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
	production:process.env.NODE_ENV === 'production',
}


export const token: string =process.env["PWRD_EVENT_DISCORD_TOKEN"]!;
