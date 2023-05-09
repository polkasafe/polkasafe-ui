import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import { IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';

const TRIGGER_NAME = 'approvalReminder';

interface Args {
	network: string;
	address: string;
	callHash: string;
}

export default async function approvalReminder(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, address, callHash } = args;

	const substrateAddress = getSubstrateAddress(address);
	if (!network || !address || !callHash || !substrateAddress) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);
	const addressDoc = await firestore_db.collection('addresses').doc(address).get();
	const addressData = addressDoc?.data();
	if (addressData) {
		const userNotificationPreferences: IUserNotificationPreferences = addressData.notification_preferences;

		const triggerTemplate = await getTriggerTemplate(firestore_db, NOTIFICATION_SOURCE.POLKASAFE, TRIGGER_NAME);
		if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

		const subject = triggerTemplate.subject;
		const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
			link: `/transactions?tab=Queue#${callHash}`,
			network
		});

		const notificationServiceInstance = new NotificationService(
			NOTIFICATION_SOURCE.POLKASAFE,
			TRIGGER_NAME,
			userNotificationPreferences,
			htmlMessage,
			textMessage,
			subject,
			{
				network
			}
		);
		notificationServiceInstance.notifyAllChannels();
	}
}
