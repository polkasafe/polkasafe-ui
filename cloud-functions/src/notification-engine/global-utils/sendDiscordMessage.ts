import axios from 'axios';
import { DISCORD_BOT_SECRETS, NOTIFICATION_SOURCE } from '../notification_engine_constants';
import createDiscordEmbed from './createDiscordEmbed';

export default async function sendDiscordMessage(source: NOTIFICATION_SOURCE, channelID: string, content: string, subject?: string) {
	const SOURCE_DISCORD_BOT_TOKEN = DISCORD_BOT_SECRETS[source].token;
	if (!SOURCE_DISCORD_BOT_TOKEN) return;

	const payload = subject ? {
		embeds: [createDiscordEmbed(subject, content)]
	} : {
		content
	};

	axios.post(`https://discord.com/api/v9/channels/${channelID}/messages`, payload, {
		headers: {
			'Authorization': `Bot ${SOURCE_DISCORD_BOT_TOKEN}`,
			'Content-Type': 'application/json'
		}
	});
}
