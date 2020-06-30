import './lib/extensions/KlasaGuild';
import './lib/extensions/KlasaMember';
import { Settings, KlasaClient } from 'klasa';
import MemberGateway from './lib/settings/MemberGateway';
declare module 'discord.js' {
	interface GuildMember {
		settings: Settings;
	}
}
declare module 'klasa' {
	interface GatewayDriver {
		members: MemberGateway;
	}
}
import Client from './lib/Client';
export default {
	Client,
	MemberGateway,
	[KlasaClient.plugin]: Client[KlasaClient.plugin]
};
