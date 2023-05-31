import axios from 'axios';
import { DISCORD_BOT_SECRETS, NOTIFICATION_SOURCE } from '../notification_engine_constants';

export default async function sendDiscordMessage(source: NOTIFICATION_SOURCE, channelID: string, content: string) {
	const SOURCE_DISCORD_BOT_TOKEN = DISCORD_BOT_SECRETS[source].token;
	if (!SOURCE_DISCORD_BOT_TOKEN) return;

	axios.post(`https://discord.com/api/v9/channels/${channelID}/messages`, {
		content
	}, {
		headers: {
			'Authorization': `Bot ${SOURCE_DISCORD_BOT_TOKEN}`,
			'Content-Type': 'application/json'
		}
	});
}
