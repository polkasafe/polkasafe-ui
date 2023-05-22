import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
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

	const { name: defaultMultisigName } = await getMultisigData(firestore_db, multisigAddress);
	const { multisigSettings, notification_preferences } = await getPSUser(firestore_db, substrateAddress);
	const { deleted, name: userMultisigName } = multisigSettings?.[multisigAddress] as IPSMultisigSettings;

	if (deleted) throw Error(`User has deleted multisig: ${multisigAddress}`);
	if (!notification_preferences) throw Error(`User has no notification preferences: ${substrateAddress}`);

	const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
	if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

	const link = `/transactions?tab=Queue#${callHash}&network=${network}&multisigAddress=${multisigAddress}`;

	const subject = triggerTemplate.subject;
	const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
		network,
		multisigName: userMultisigName || defaultMultisigName,
		multisigAddress: multisigAddress,
		link: `https://app.polkasafe.xyz${link}`
	});

	const notificationServiceInstance = new NotificationService(
		SOURCE,
		TRIGGER_NAME,
		htmlMessage,
		textMessage,
		subject,
		{
			network,
			link
		}
	);
	notificationServiceInstance.notifyAllChannels(notification_preferences);
}
