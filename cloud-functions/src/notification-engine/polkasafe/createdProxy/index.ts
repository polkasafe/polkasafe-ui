import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import { IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import isValidTemplateArgs from '../../global-utils/isValidTemplateArgs';

const TRIGGER_NAME = 'createdProxy';
const SOURCE = NOTIFICATION_SOURCE.POLKASAFE;

interface Args {
	network: string;
	addresses: string[];
	callHash: string;
}

export default async function createdProxy(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);

	const { network, addresses, callHash } = args;
	if (!network || !addresses || !callHash || !Array.isArray(addresses) || !addresses.length) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	// convert to substrateAddresses and dedupe
	const substrateAddresses: string[] = addresses.reduce((acc, curr) => {
		const substrateAddr = getSubstrateAddress(curr);
		if (substrateAddr && !acc.includes(substrateAddr)) {
			acc.push(substrateAddr);
		}
		return acc;
	}, [] as string[]);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	for (const address of substrateAddresses) {
		const addressDoc = await firestore_db.collection('addresses').doc(address).get();
		const addressData = addressDoc?.data();
		if (addressData) {
			const userNotificationPreferences: IUserNotificationPreferences = addressData.notification_preferences;

			const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
			if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

			if (triggerTemplate.args.length > 0 && !isValidTemplateArgs(args, triggerTemplate.args)) throw Error(`Invalid arguments for trigger template : ${TRIGGER_NAME}`);

			const subject = triggerTemplate.subject;
			const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, args);

			const notificationServiceInstance = new NotificationService(
				SOURCE,
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
}
