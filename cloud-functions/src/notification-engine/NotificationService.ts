import TelegramBot from 'node-telegram-bot-api';
import { Client as DiscordClient, GatewayIntentBits, TextChannel } from 'discord.js';
import sgMail from '@sendgrid/mail';
import getSourceFirebaseAdmin from './global-utils/getSourceFirebaseAdmin';
import { IPolkasafeNotification } from './polkasafe/_utils/types';
import { CHANNEL, DISCORD_BOT_TOKEN, IUserNotificationPreferences, NOTIFICATION_SOURCE, NOTIFICATION_SOURCE_EMAIL, SENDGRID_API_KEY, TELEGRAM_BOT_TOKEN } from './notification_engine_constants';

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

		if (this.notificationPreferences.channelPreferences[CHANNEL.EMAIL].enabled) this.sendEmailNotification();
		if (this.notificationPreferences.channelPreferences[CHANNEL.TELEGRAM].enabled) this.sendTelegramNotification();
		if (this.notificationPreferences.channelPreferences[CHANNEL.DISCORD].enabled) this.sendDiscordNotification();
		if (this.notificationPreferences.channelPreferences[CHANNEL.ELEMENT].enabled) this.sendElementNotification();
		if (this.notificationPreferences.channelPreferences[CHANNEL.IN_APP].enabled) this.sendInAppNotification();
		if (this.notificationPreferences.channelPreferences[CHANNEL.SLACK].enabled) this.sendSlackNotification();
	}

	private async sendEmailNotification(): Promise<void> {
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
		if (!TELEGRAM_BOT_TOKEN) return;
		const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

		const chatId = this.notificationPreferences.channelPreferences[CHANNEL.TELEGRAM].handle;

		bot.sendMessage(chatId, this.message).catch((error) => console.error('Error in sending telegram : ', error));
	}

	private async sendDiscordNotification(): Promise<void> {
		if (!DISCORD_BOT_TOKEN) return;
		const client = new DiscordClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

		const channelId = this.notificationPreferences.channelPreferences[CHANNEL.DISCORD].handle;
		const channel = client.channels.cache.get(channelId) as TextChannel;
		if (!channel) return console.error(`Failed to find channel with id ${channelId}`);

		channel.send(this.message).catch((error) => console.error('Error in sending Discord message : ', error));
		client.destroy();
	}

	private async sendElementNotification(): Promise<void> {
		console.log('message : ', this.message);
	}

	private async sendSlackNotification(): Promise<void> {
		console.log('message : ', this.message);
	}

	private async sendInAppNotification(): Promise<void> {
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
