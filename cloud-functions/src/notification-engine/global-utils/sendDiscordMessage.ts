import axios from 'axios';
import { DISCORD_BOT_TOKEN } from '../notification_engine_constants';

export default async function sendDiscordMessage(channelID: string, content: string) {
	axios.post(`https://discord.com/api/v9/channels/${channelID}/messages`, {
		content
	}, {
		headers: {
			'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
			'Content-Type': 'application/json'
		}
	});
}
