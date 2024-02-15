import { NotificationService } from '../../NotificationService';
import { CHANNEL, IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import validator from 'validator';

const TRIGGER_NAME = 'resetPassword';
const SOURCE = NOTIFICATION_SOURCE.TOWNHALL;

interface Args {
	email: string;
	resetUrl: string;
}

export default async function resetPassword(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { email, resetUrl } = args;

	if (!email || !resetUrl || !validator.isURL(resetUrl) || !validator.isEmail(email)) {
		throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);
	}

	const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(SOURCE, TRIGGER_NAME, {
		...args,
		resetUrl
	});

	const pseudoNotificationPreferences: IUserNotificationPreferences = {
		triggerPreferences: {},
		channelPreferences: {
			[CHANNEL.EMAIL]: {
				name: CHANNEL.EMAIL,
				enabled: true,
				handle: email,
				verified: false,
				verification_token: ''
			}
		}
	};

	const notificationServiceInstance = new NotificationService(
		SOURCE,
		TRIGGER_NAME,
		htmlMessage,
		markdownMessage,
		textMessage,
		subject
	);
	notificationServiceInstance.sendEmailNotification(pseudoNotificationPreferences, true);
}
