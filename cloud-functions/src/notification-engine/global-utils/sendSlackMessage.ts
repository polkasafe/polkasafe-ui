import axios from 'axios';
import { NOTIFICATION_SOURCE, SLACK_BOT_TOKEN } from '../notification_engine_constants';

export default async function sendSlackMessage(source: NOTIFICATION_SOURCE, userId: string, message: string) {
	try {
		const response = await axios.post('https://slack.com/api/chat.postMessage', {
			channel: userId,
			text: message
		}, {
			headers: {
				'Authorization': `Bearer ${SLACK_BOT_TOKEN[source]}`,
				'Content-Type': 'application/json'
			}
		});

		if (response.data.ok) {
			console.log('Message sent successfully!');
		} else {
			console.error('Failed to send message:', response.data.error);
		}
	} catch (error) {
		console.error('Error sending message:', error);
	}
}
