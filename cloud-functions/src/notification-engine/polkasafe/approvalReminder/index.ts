import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTransactionData from '../_utils/getTransactionData';
import getPSUser from '../_utils/getPSUser';
import { IPSMultisigSettings } from '../_utils/types';
import getMultisigData from '../_utils/getMultisigData';

const TRIGGER_NAME = 'approvalReminder';
const SOURCE = NOTIFICATION_SOURCE.POLKASAFE;

interface Args {
	network: string;
	address: string;
	callHash: string;
	multisigAddress: string;
}

export default async function approvalReminder(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, address, callHash, multisigAddress } = args;

	const substrateAddress = getSubstrateAddress(address);
	if (!network || !address || !callHash || !substrateAddress) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const { from } = await getTransactionData(firestore_db, callHash);
	if (from === address || from === substrateAddress) return; // no need to send notification to creator

	const { name: defaultMultisigName } = await getMultisigData(firestore_db, multisigAddress, network);
	const { multisigSettings, notification_preferences = null } = await getPSUser(firestore_db, substrateAddress);
	const { deleted = false, name: userMultisigName = defaultMultisigName } = multisigSettings?.[`${multisigAddress}_${network}`] as IPSMultisigSettings || {};

	if (deleted) throw Error(`User has deleted multisig: ${multisigAddress}`);
	if (!notification_preferences) throw Error(`User has no notification preferences: ${substrateAddress}`);

	const link = `/transactions?tab=Queue#${callHash}&network=${network}&multisigAddress=${multisigAddress}`;

	const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(
		SOURCE,
		TRIGGER_NAME,
		{
			network,
			multisigName: userMultisigName || defaultMultisigName,
			multisigAddress: multisigAddress,
			link: `https://app.polkasafe.xyz${link}`
		});

	const notificationServiceInstance = new NotificationService(
		SOURCE,
		TRIGGER_NAME,
		htmlMessage,
		markdownMessage,
		textMessage,
		subject,
		{
			network,
			link
		}
	);
	await notificationServiceInstance.notifyAllChannels(notification_preferences);

	// update last notified time
	const txDoc = await firestore_db.collection('transactions').doc(callHash).get();
	let { notifications } = txDoc.data() || {};

	notifications = {
		...notifications,
		[substrateAddress]: {
			lastNotified: new Date()
		}
	};

	await firestore_db.collection('transactions').doc(callHash).set({
		notifications
	}, { merge: true });
}
