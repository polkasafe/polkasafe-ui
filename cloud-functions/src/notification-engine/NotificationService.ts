import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import { WebClient as SlackWebClient } from '@slack/web-api';
import { Client as DiscordClient, GatewayIntentBits, TextChannel } from 'discord.js';
import sgMail from '@sendgrid/mail';
import getSourceFirebaseAdmin from './global-utils/getSourceFirebaseAdmin';
import { IPolkasafeNotification } from './polkasafe/_utils/types';
import { CHANNEL, DISCORD_BOT_TOKEN, ELEMENT_API_KEY, IUserNotificationPreferences, NOTIFICATION_SOURCE, NOTIFICATION_SOURCE_EMAIL, SENDGRID_API_KEY, SLACK_BOT_TOKEN, TELEGRAM_BOT_TOKEN } from './notification_engine_constants';

export class NotificationService {
	constructor(
		private readonly source: NOTIFICATION_SOURCE,
		private readonly trigger: string,
		private readonly notificationPreferences: IUserNotificationPreferences,
		private readonly htmlMessage: string,
		private readonly message: string,
		private readonly subject: string,
		private readonly sourceArgs?: {[index: string]: any} // additional data a source might need
	) {
		if (SENDGRID_API_KEY) {
			sgMail.setApiKey(SENDGRID_API_KEY);
		}
	}

	public async sendNotification(): Promise<void> {
		if (!this.notificationPreferences.triggerPreferences[this.trigger]) return;

		this.sendEmailNotification();
		this.sendTelegramNotification();
		this.sendDiscordNotification();
		this.sendElementNotification();
		this.sendSlackNotification();
		this.sendInAppNotification();
	}

	private async sendEmailNotification(): Promise<void> {
		if (!SENDGRID_API_KEY || !this.notificationPreferences.channelPreferences[CHANNEL.EMAIL].enabled) return;

		const FROM = {
			email: NOTIFICATION_SOURCE_EMAIL[this.source],
			name: this.source
		};

		const msg = {
			from: FROM,
			html: this.htmlMessage,
			subject: this.subject,
			text: this.message,
			to: this.notificationPreferences.channelPreferences[CHANNEL.EMAIL].handle
		};

		sgMail.send(msg).catch((e) => console.error('Error in sending email : ', e));
	}

	private async sendTelegramNotification(): Promise<void> {
		if (!TELEGRAM_BOT_TOKEN || !this.notificationPreferences.channelPreferences[CHANNEL.TELEGRAM].enabled) return;
		const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

		const chatId = this.notificationPreferences.channelPreferences[CHANNEL.TELEGRAM].handle;

		bot.sendMessage(chatId, this.message).catch((error) => console.error('Error in sending telegram : ', error));
	}

	private async sendDiscordNotification(): Promise<void> {
		if (!DISCORD_BOT_TOKEN || !this.notificationPreferences.channelPreferences[CHANNEL.DISCORD].enabled) return;
		const client = new DiscordClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

		const channelId = this.notificationPreferences.channelPreferences[CHANNEL.DISCORD].handle;
		const channel = client.channels.cache.get(channelId) as TextChannel;
		if (!channel) return console.error(`Failed to find channel with id ${channelId}`);

		channel.send(this.message).catch((error) => console.error('Error in sending Discord message : ', error));
		client.destroy();
	}

	private async sendElementNotification(): Promise<void> {
		if (!ELEMENT_API_KEY || !this.notificationPreferences.channelPreferences[CHANNEL.ELEMENT].enabled) return;
		const roomId = this.notificationPreferences.channelPreferences[CHANNEL.ELEMENT].handle;

		const requestBody = {
			roomId: this.notificationPreferences.channelPreferences[CHANNEL.ELEMENT].handle,
			body: this.message,
			messageType: 'text'
		};

		const config = {
			headers: { 'Authorization': `Bearer ${ELEMENT_API_KEY}` }
		};

		try {
			await axios.post('https://api.element.io/v1/rooms/' + roomId + '/send', requestBody, config);
		} catch (error) {
			console.error('Error in sending Element message: ', error);
		}
	}

	private async sendSlackNotification(): Promise<void> {
		if (!SLACK_BOT_TOKEN || !this.notificationPreferences.channelPreferences[CHANNEL.SLACK].enabled) return;
		const client = new SlackWebClient(SLACK_BOT_TOKEN);
		try {
			await client.chat.postMessage({
				channel: this.notificationPreferences.channelPreferences[CHANNEL.SLACK].handle,
				text: this.message
			});
		} catch (error) {
			console.error(`Error sending slack message: ${error}`);
		}
	}

	private async sendInAppNotification(): Promise<void> {
		if (!this.notificationPreferences.channelPreferences[CHANNEL.IN_APP].enabled) return;

		const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);
		let newNotificationRef;
		let newNotification;

		switch (this.source) {
		case NOTIFICATION_SOURCE.POLKASAFE:
			if (!this.sourceArgs?.network) return;

			newNotificationRef = firestore_db.collection('notifications').doc();
			newNotification = {
				id: newNotificationRef.id,
				address: this.notificationPreferences.channelPreferences?.[CHANNEL.IN_APP]?.handle,
				created_at: new Date(),
				message: this.message,
				type: 'sent',
				network: String(this.sourceArgs.network)
			} as IPolkasafeNotification;
		}

		if (newNotificationRef && newNotification) newNotificationRef.set(newNotification, { merge: true });
	}
}
