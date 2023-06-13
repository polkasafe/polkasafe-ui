import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EPAProposalType, IPAUser } from '../_utils/types';
import { paUserRef } from '../_utils/paFirestoreRefs';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import getPostTypeNameFromPostType from '../_utils/getPostTypeNameFromPostType';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';

const TRIGGER_NAME = 'ownProposalCreated';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string;
	proposerAddress: string;
}

export default async function ownProposalCreated(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId, proposerAddress } = args;
	const proposerSubstrateAddress = getSubstrateAddress(proposerAddress || '');
	if (!network || !postType || !postId || typeof postId !== 'string' || !proposerAddress || !proposerSubstrateAddress) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	// get user with address
	const addressDoc = await firestore_db.collection('addresses').doc(proposerSubstrateAddress).get();
	if (!addressDoc.exists) throw Error(`Address not found: ${proposerSubstrateAddress}`);
	const addressDocData = addressDoc.data() as { user_id: number };
	if (!addressDocData.user_id) throw Error(`User not found for address : ${proposerSubstrateAddress}`);

	const proposerUserDoc = await paUserRef(firestore_db, addressDocData.user_id).get();
	if (!proposerUserDoc.exists) throw Error(`User not found for address : ${proposerSubstrateAddress}`);

	const proposerUserData = proposerUserDoc.data() as IPAUser;
	if (!proposerUserData.notification_preferences) throw Error(`Notification preferences not found for user: ${addressDocData.user_id}`);
	const proposerNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs(proposerUserData.notification_preferences, network);
	if (!proposerNotificationPreferences) throw Error(`Notification preferences not found for user: ${addressDocData.user_id}`);

	const link = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as EPAProposalType)}/${postId}`;

	const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
	if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

	const postTypeName = getPostTypeNameFromPostType(postType as EPAProposalType);

	const subject = triggerTemplate.subject;
	const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
		...args,
		username: proposerUserData.username,
		link,
		postType: postTypeName
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
	await notificationServiceInstance.notifyAllChannels(proposerNotificationPreferences);
}
