import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import sgMail from '@sendgrid/mail';
import getSourceFirebaseAdmin from './global-utils/getSourceFirebaseAdmin';
import { IPSNotification } from './polkasafe/_utils/types';
import { CHANNEL, ELEMENT_API_KEY, IUserNotificationPreferences, NOTIFICATION_SOURCE, NOTIFICATION_SOURCE_EMAIL, SENDGRID_API_KEY, SLACK_BOT_TOKEN, TELEGRAM_BOT_TOKEN, DISCORD_BOT_SECRETS } from './notification_engine_constants';
import { IPANotification } from './polkassembly/_utils/types';
import sendDiscordMessage from './global-utils/sendDiscordMessage';
import sendSlackMessage from './global-utils/sendSlackMessage';
import { ITHNotification } from './townhall/_utils/types';

export class NotificationService {
	constructor(
		protected readonly source: NOTIFICATION_SOURCE,
		protected readonly trigger: string,
		protected readonly htmlMessage: string,
		protected readonly markdownMessage: string,
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

		await this.sendEmailNotification(userNotificationPreferences);
		await this.sendTelegramNotification(userNotificationPreferences);
		await this.sendDiscordNotification(userNotificationPreferences);
		await this.sendElementNotification(userNotificationPreferences);
		await this.sendSlackNotification(userNotificationPreferences);
		await this.sendInAppNotification(userNotificationPreferences);
	}

	public async sendEmailNotification(userNotificationPreferences: IUserNotificationPreferences, isVerificationEmail?: boolean): Promise<void> {
		console.log('sendEmailNotification called with : ', {
			handle: userNotificationPreferences.channelPreferences?.[CHANNEL.EMAIL]?.handle,
			triggerEnabled: userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled,
			channelEnabled: userNotificationPreferences.channelPreferences?.[CHANNEL.EMAIL]?.enabled,
			channelVerified: userNotificationPreferences.channelPreferences?.[CHANNEL.EMAIL]?.verified
		});

		if (!SENDGRID_API_KEY ||
			(!isVerificationEmail && !userNotificationPreferences?.triggerPreferences?.[this.trigger]?.enabled) ||
			(!isVerificationEmail && !userNotificationPreferences?.channelPreferences?.[CHANNEL.EMAIL]?.enabled) ||
			(!isVerificationEmail && !userNotificationPreferences?.channelPreferences?.[CHANNEL.EMAIL]?.verified)
		) {
			console.log('sendEmailNotification returning as conditions not met');
			return;
		}

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

		console.log('Sending email : ', {
			handle: userNotificationPreferences?.channelPreferences?.[CHANNEL.EMAIL]?.handle,
			source: this.source,
			trigger: this.trigger
		});

		await sgMail.send(msg).catch((e) => console.error('Error in sending email : ', e));
	}

	public async sendTelegramNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		console.log('sendTelegramNotification called with : ', {
			handle: userNotificationPreferences.channelPreferences?.[CHANNEL.TELEGRAM]?.handle,
			triggerEnabled: userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled,
			channelEnabled: userNotificationPreferences.channelPreferences?.[CHANNEL.TELEGRAM]?.enabled,
			channelVerified: userNotificationPreferences.channelPreferences?.[CHANNEL.TELEGRAM]?.verified
		});

		const SOURCE_TELEGRAM_BOT_TOKEN = TELEGRAM_BOT_TOKEN[this.source];

		if (!SOURCE_TELEGRAM_BOT_TOKEN ||
			!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.TELEGRAM]?.enabled
		) {
			console.log('sendTelegramNotification returning as conditions not met');
			return;
		}

		const bot = new TelegramBot(SOURCE_TELEGRAM_BOT_TOKEN, { polling: false });

		const chatId = userNotificationPreferences.channelPreferences?.[CHANNEL.TELEGRAM]?.handle;

		console.log('Sending Telegram notification : ', {
			handle: chatId,
			source: this.source,
			trigger: this.trigger
		});

		await bot.sendMessage(chatId, this.markdownMessage, { parse_mode: 'Markdown' }).catch((error) => console.error('Error in sending telegram : ', error));
	}

	public async sendDiscordNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		console.log('sendDiscordNotification called with : ', {
			handle: userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.handle,
			triggerEnabled: userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled,
			channelEnabled: userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.enabled,
			channelVerified: userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.verified
		});

		const SOURCE_DISCORD_BOT_TOKEN = DISCORD_BOT_SECRETS[this.source].token;

		if (!SOURCE_DISCORD_BOT_TOKEN ||
			!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.handle
		) {
			console.log('sendDiscordNotification returning as conditions not met');
			return;
		}

		console.log('Sending Discord notification : ', {
			handle: userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.handle,
			source: this.source,
			trigger: this.trigger
		});

		await sendDiscordMessage(
			this.source,
			userNotificationPreferences.channelPreferences?.[CHANNEL.DISCORD]?.handle,
			this.markdownMessage,
			this.subject,
		).catch((error) => console.error('Error in sending Discord message : ', error));
	}

	public async sendElementNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		console.log('sendElementNotification called with : ', {
			handle: userNotificationPreferences.channelPreferences?.[CHANNEL.ELEMENT]?.handle,
			triggerEnabled: userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled,
			channelEnabled: userNotificationPreferences.channelPreferences?.[CHANNEL.ELEMENT]?.enabled,
			channelVerified: userNotificationPreferences.channelPreferences?.[CHANNEL.ELEMENT]?.verified
		});

		if (!ELEMENT_API_KEY ||
			!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.ELEMENT]?.enabled
		) {
			console.log('sendElementNotification returning as conditions not met');
			return;
		}

		const roomId = userNotificationPreferences.channelPreferences?.[CHANNEL.ELEMENT]?.handle;

		const requestBody = {
			roomId,
			body: this.message,
			messageType: 'text'
		};

		const config = {
			headers: { 'Authorization': `Bearer ${ELEMENT_API_KEY}` }
		};

		console.log('Sending Element notification : ', {
			handle: roomId,
			source: this.source,
			trigger: this.trigger
		});

		try {
			await axios.post('https://api.element.io/v1/rooms/' + roomId + '/send', requestBody, config);
		} catch (error) {
			console.error('Error in sending Element message: ', error);
		}
	}

	public async sendSlackNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		console.log('sendSlackNotification called with : ', {
			handle: userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.handle,
			triggerEnabled: userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled,
			channelEnabled: userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.enabled,
			channelVerified: userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.verified
		});

		const SOURCE_SLACK_BOT_TOKEN = SLACK_BOT_TOKEN[this.source];

		if (!SOURCE_SLACK_BOT_TOKEN ||
			!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.handle
		) {
			console.log('sendSlackNotification returning as conditions not met');
			return;
		}
		try {
			console.log('Sending slack notification : ', {
				handle: userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.handle,
				source: this.source,
				trigger: this.trigger
			});

			await sendSlackMessage(this.source, String(userNotificationPreferences.channelPreferences?.[CHANNEL.SLACK]?.handle), this.markdownMessage);
		} catch (error) {
			console.error(`Error sending slack message: ${error}`);
		}
	}

	public async sendInAppNotification(userNotificationPreferences: IUserNotificationPreferences): Promise<void> {
		if (!userNotificationPreferences.triggerPreferences?.[this.trigger]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.IN_APP]?.enabled ||
			!userNotificationPreferences.channelPreferences?.[CHANNEL.IN_APP]?.handle
		) return;

		const { firestore_db } = getSourceFirebaseAdmin(this.source);
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
				message: this.markdownMessage,
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
				message: this.markdownMessage,
				network: String(this.sourceArgs.network),
				title: this.subject,
				url: this.sourceArgs.link || '',
				trigger: this.trigger
			} as IPANotification;
			break;

		case NOTIFICATION_SOURCE.TOWNHALL:
			newNotificationRef = firestore_db.collection('users').doc(String(userNotificationPreferences.channelPreferences?.[CHANNEL.IN_APP]?.handle)).collection('notifications').doc();
			newNotification = {
				id: newNotificationRef.id,
				created_at: new Date(),
				title: this.subject,
				message: this.markdownMessage,
				url: this.sourceArgs?.link || ''
			} as ITHNotification;
			break;
		}

		if (newNotificationRef && newNotification) {
			await newNotificationRef.set(newNotification, { merge: true });
		}
	}
}
