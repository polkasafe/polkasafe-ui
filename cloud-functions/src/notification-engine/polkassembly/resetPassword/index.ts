import { NotificationService } from '../../NotificationService';
import { CHANNEL, IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import validator from 'validator';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';

const TRIGGER_NAME = 'resetPassword';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	email: string;
	resetUrl: string;
}

export default async function resetPassword(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { email, resetUrl } = args;

	if (!email || !resetUrl || !validator.isURL(resetUrl) || !validator.isEmail(email)) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
	if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

	const subject = triggerTemplate.subject;
	const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
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
		textMessage,
		subject
	);
	notificationServiceInstance.sendEmailNotification(pseudoNotificationPreferences, true);
}
