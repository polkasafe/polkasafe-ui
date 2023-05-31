import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import sgMail from '@sendgrid/mail';
import getSourceFirebaseAdmin from './global-utils/getSourceFirebaseAdmin';
import { IPSNotification } from './polkasafe/_utils/types';
import { CHANNEL, ELEMENT_API_KEY, IUserNotificationPreferences, NOTIFICATION_SOURCE, NOTIFICATION_SOURCE_EMAIL, SENDGRID_API_KEY, SLACK_BOT_TOKEN, TELEGRAM_BOT_TOKEN, DISCORD_BOT_SECRETS } from './notification_engine_constants';
import { IPANotification } from './polkassembly/_utils/types';
import sendDiscordMessage from './global-utils/sendDiscordMessage';
import sendSlackMessage from './global-utils/sendSlackMessage';

export class NotificationService {
	constructor(
		protected readonly source: NOTIFICATION_SOURCE,
		protected readonly trigger: string,
		protected readonly htmlMessage: string,
		protected readonly message: string,
		protected readonly subject: string,
		protected readonly sourceArgs?: {[index: string]: any} // additional data a source might need
	) {
		if (SENDGRID_API_KEY) {
			sgMail.setApiKey(SENDGRID_API_KEY);
		}
	}

	public async notifyAllChannels(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		if (!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled) return;

		this.sendEmailNotification(userNotificationPreferences);
		this.sendTelegramNotification(userNotificationPreferences);
		this.sendDiscordNotification(userNotificationPreferences);
		this.sendElementNotification(userNotificationPreferences);
		this.sendSlackNotification(userNotificationPreferences);
		this.sendInAppNotification(userNotificationPreferences);
	}

	public async sendEmailNotification(userNotificationPreferences: IUserNotificationPreferences, isVerificationEmail?: boolean): Promise<void> {
		if (!SENDGRID_API_KEY ||
			(!isVerificationEmail && !userNotificationPreferences?.triggerPreferences?.[this.trigger]?.enabled)||
			(!isVerificationEmail && !userNotificationPreferences?.channelPreferences?.[CHANNEL.EMAIL]?.enabled) ||
			(!isVerificationEmail && !userNotificationPreferences?.channelPreferences?.[CHANNEL.EMAIL]?.verified)
		) return;

		const FROM = {
			email: NOTIFICATION_SOURCE_EMAIL[this.source],
			name: `${this.source.charAt(0).toUpperCase()}${this.source.slice(1)}`
		};

		const msg = {
			from: FROM,
			html: this.htmlMessage,
			subject: this.subject,
			text: this.message,
			to: userNotificationPreferences?.channelPreferences?.[CHANNEL.EMAIL]?.handle
		};

		sgMail.send(msg).catch((e) => console.error('Error in sending email : ', e));
	}

	public async sendTelegramNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		const SOURCE_TELEGRAM_BOT_TOKEN = TELEGRAM_BOT_TOKEN[this.source];

		if (!SOURCE_TELEGRAM_BOT_TOKEN ||
			!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.TELEGRAM]?.enabled
		) return;

		const bot = new TelegramBot(SOURCE_TELEGRAM_BOT_TOKEN, { polling: false });

		const chatId = userNotificationPreferences.channelPreferences?.[CHANNEL.TELEGRAM]?.handle;

		bot.sendMessage(chatId, this.message).catch((error) => console.error('Error in sending telegram : ', error));
	}

	public async sendDiscordNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		const SOURCE_DISCORD_BOT_TOKEN = DISCORD_BOT_SECRETS[this.source].token;

		if (!SOURCE_DISCORD_BOT_TOKEN ||
			!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.handle
		) return;

		await sendDiscordMessage(
			this.source,
			userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.handle,
			this.message
		).catch((error) => console.error('Error in sending Discord message : ', error));
	}

	public async sendElementNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		if (!ELEMENT_API_KEY ||
			!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.ELEMENT]?.enabled
		) return;

		const roomId = userNotificationPreferences.channelPreferences?.[CHANNEL.ELEMENT]?.handle;

		const requestBody = {
			roomId: userNotificationPreferences.channelPreferences?.[CHANNEL.ELEMENT]?.handle,
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

	public async sendSlackNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		const SOURCE_SLACK_BOT_TOKEN = SLACK_BOT_TOKEN[this.source];

		if (!SOURCE_SLACK_BOT_TOKEN ||
			!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.handle
		) return;
		try {
			await sendSlackMessage(this.source, String(userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.handle), this.message);
		} catch (error) {
			console.error(`Error sending slack message: ${error}`);
		}
	}

	public async sendInAppNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		if (!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.IN_APP]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.IN_APP]?.handle
		) return;

		const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);
		let newNotificationRef;
		let newNotification;

		switch (this.source) {
		case NOTIFICATION_SOURCE.POLKASAFE:
			if (!this.sourceArgs?.network) return;

			newNotificationRef = firestore_db.collection('notifications').doc();
			newNotification = {
				id: newNotificationRef.id,
				address: userNotificationPreferences.channelPreferences?.[CHANNEL.IN_APP]?.handle,
				created_at: new Date(),
				link: this.sourceArgs.link || '',
				message: this.message,
				type: 'sent',
				network: String(this.sourceArgs.network)
			} as IPSNotification;
			break;

		case NOTIFICATION_SOURCE.POLKASSEMBLY:
			if (!this.sourceArgs?.network) return;
			newNotificationRef = firestore_db.collection('users').doc(String(userNotificationPreferences.channelPreferences?.[CHANNEL.IN_APP]?.handle)).collection('notifications').doc();
			newNotification = {
				id: newNotificationRef.id,
				userId: Number(userNotificationPreferences.channelPreferences?.[CHANNEL.IN_APP]?.handle),
				created_at: new Date(),
				message: this.message,
				network: String(this.sourceArgs.network),
				title: this.subject,
				url: this.sourceArgs.link || ''
			} as IPANotification;
		}

		if (newNotificationRef && newNotification) newNotificationRef.set(newNotification, { merge: true });
	}
}
