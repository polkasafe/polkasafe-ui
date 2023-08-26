import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getMultisigData from '../_utils/getMultisigData';
import getPSUser from '../_utils/getPSUser';
import { IPSMultisigSettings } from '../_utils/types';

const TRIGGER_NAME = 'editMultisigUsersExecuted';
const SOURCE = NOTIFICATION_SOURCE.POLKASAFE;

interface Args {
	address: string;
	network: string;
	addresses: string[];
	callHash: string;
	multisigAddress: string;
}

export default async function editMultisigUsersExecuted(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);

	const { address, network, addresses, callHash, multisigAddress } = args;
	const substrateAddress = getSubstrateAddress(address);
	if (!substrateAddress || !network || !addresses || !callHash || !Array.isArray(addresses) || !addresses.length) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

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
			const { name: defaultMultisigName } = await getMultisigData(firestore_db, multisigAddress, network);
			const { multisigSettings, notification_preferences = null } = await getPSUser(firestore_db, address);
			const { deleted = false, name: userMultisigName = defaultMultisigName } = multisigSettings?.[multisigAddress] as IPSMultisigSettings || {};

			if (deleted || !notification_preferences) continue; // skip if multisig is deleted or user has no notification preferences

			const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(
				SOURCE,
				TRIGGER_NAME,
				{
					...args,
					multisigName: userMultisigName || defaultMultisigName
				}
			);

			const notificationServiceInstance = new NotificationService(
				SOURCE,
				TRIGGER_NAME,
				htmlMessage,
				markdownMessage,
				textMessage,
				subject,
				{
					network
				}
			);
			notificationServiceInstance.notifyAllChannels(notification_preferences);
		}
	}
}
