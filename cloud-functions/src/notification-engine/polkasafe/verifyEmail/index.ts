import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import { CHANNEL, IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

const TRIGGER_NAME = 'verifyEmail';
const SOURCE = NOTIFICATION_SOURCE.POLKASAFE;

interface Args {
	email: string;
	address: string;
}

export default async function verifyEmail(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { email, address } = args;

	const substrateAddress = getSubstrateAddress(address);
	if (!email || !address || !substrateAddress || !validator.isEmail(email)) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);
	const addressDoc = await firestore_db.collection('addresses').doc(address).get();
	const addressData = addressDoc?.data();
	if (addressData) {
		const userNotificationPreferences: IUserNotificationPreferences = addressData.notification_preferences;
		const token = uuidv4();

		const updatedNotificationPreferences: IUserNotificationPreferences = {
			triggerPreferences: { ...(userNotificationPreferences?.triggerPreferences || {}) },
			channelPreferences: {
				...userNotificationPreferences.channelPreferences,
				[CHANNEL.EMAIL]: {
					name: CHANNEL.EMAIL,
					enabled: true,
					handle: email,
					verified: false,
					verification_token: token
				}
			}
		};

		const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
		if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

		const subject = triggerTemplate.subject;
		const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
			...args,
			token
		});

		await addressDoc.ref.update({
			notification_preferences: updatedNotificationPreferences
		});

		const notificationServiceInstance = new NotificationService(
			SOURCE,
			TRIGGER_NAME,
			htmlMessage,
			textMessage,
			subject
		);
		await notificationServiceInstance.sendEmailNotification(updatedNotificationPreferences, true);
	}
}
