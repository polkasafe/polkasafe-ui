import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import { IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import template from './template';
import getTemplateRender from '../../global-utils/getTemplateRender';

interface Args {
	network: string;
	addresses: string[];
	callHash: string;
}

export default async function initMultisigTransfer(args: Args) {
	if (!args) throw Error('Missing arguments for trigger');

	const { network, addresses, callHash } = args;
	if (!network || !addresses || !callHash || !Array.isArray(addresses) || !addresses.length) throw Error('Invalid arguments for trigger');

	// convert to substrateAddresses and dedupe
	const substrateAddresses: string[] = addresses.reduce((acc, curr) => {
		const substrateAddr = getSubstrateAddress(curr);
		if (substrateAddr && !acc.includes(substrateAddr)) {
			acc.push(substrateAddr);
		}
		return acc;
	}, [] as string[]);

	const { firestore_db } = getSourceFirebaseAdmin(NOTIFICATION_SOURCE.POLKASAFE);

	for (const address of substrateAddresses) {
		const addressDoc = await firestore_db.collection('addresses').doc(address).get();
		const addressData = addressDoc?.data();
		if (addressData) {
			const userNotificationPreferences: IUserNotificationPreferences = addressData.notification_preferences;

			const subject = 'New multisig transaction to sign on Polkasafe.';
			const { htmlMessage, textMessage } = getTemplateRender(template, {
				link: `/transactions?tab=Queue#${callHash}`,
				network
			});

			const notificationServiceInstance = new NotificationService(
				NOTIFICATION_SOURCE.POLKASAFE,
				'initMultisigTransfer',
				userNotificationPreferences,
				htmlMessage,
				textMessage,
				subject,
				{
					network
				}
			);
			notificationServiceInstance.sendNotification();
		}
	}
}
