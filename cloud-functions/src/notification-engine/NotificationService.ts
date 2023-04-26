import { CHANNEL, IUserNotificationPreferences } from '../constants/notification_engine_constants';

export class NotificationService {
	constructor(
		private readonly notificationPreferences: IUserNotificationPreferences,
		private readonly message: string) {
	}

	public async sendNotification(): Promise<void> {
		if (this.notificationPreferences[CHANNEL.EMAIL].enabled) {
			await this.sendEmailNotification();
		}

		if (this.notificationPreferences[CHANNEL.TELEGRAM].enabled) {
			await this.sendTelegramNotification();
		}

		if (this.notificationPreferences[CHANNEL.DISCORD].enabled) {
			await this.sendDiscordNotification();
		}

		if (this.notificationPreferences[CHANNEL.ELEMENT].enabled) {
			await this.sendElementNotification();
		}

		if (this.notificationPreferences[CHANNEL.SMS].enabled) {
			await this.sendSMSNotification();
		}
	}

	private async sendEmailNotification(): Promise<void> {
		console.log('message : ', this.message);
	}

	private async sendTelegramNotification(): Promise<void> {
		console.log('message : ', this.message);
	}

	private async sendDiscordNotification(): Promise<void> {
		console.log('message : ', this.message);
	}

	private async sendElementNotification(): Promise<void> {
		console.log('message : ', this.message);
	}

	private async sendSMSNotification(): Promise<void> {
		console.log('message : ', this.message);
	}
}
