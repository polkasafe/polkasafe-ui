import { NotificationService } from '../../NotificationService';
import { CHANNEL, IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import validator from 'validator';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';

const TRIGGER_NAME = 'verifyEmail';
const SOURCE = NOTIFICATION_SOURCE.POLKASAFE;

interface Args {
	email: string;
	verifyUrl: string;
}

export default async function verifyEmail(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { email, verifyUrl } = args;

	if (!email || !verifyUrl || !validator.isURL(verifyUrl) || !validator.isEmail(email)) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
	if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

	const subject = triggerTemplate.subject;
	const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
		...args,
		verifyUrl
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
		pseudoNotificationPreferences,
		htmlMessage,
		textMessage,
		subject
	);
	notificationServiceInstance.sendEmailNotification(pseudoNotificationPreferences, true);
}
