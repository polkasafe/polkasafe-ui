import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EPAProposalType, IPAUser } from '../_utils/types';
import { paUserRef } from '../_utils/paFirestoreRefs';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import getPostTypeNameFromPostType from '../_utils/getPostTypeNameFromPostType';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';
import subsquidToFirestoreProposalType from '../_utils/subsquidToFirestoreProposalType';

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

	const firestorePostType = subsquidToFirestoreProposalType(postType);
	if (!firestorePostType) throw Error(`Invalid postType for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	// get user with address
	const addressDoc = await firestore_db.collection('addresses').doc(proposerSubstrateAddress).get();
	if (!addressDoc.exists) throw Error(`Address not found: ${proposerSubstrateAddress}`);
	const addressDocData = addressDoc.data() as { user_id: number };
	if (!addressDocData.user_id) {
		console.log(`User not found for address : ${proposerSubstrateAddress}`);
		return;
	}

	const proposerUserDoc = await paUserRef(firestore_db, addressDocData.user_id).get();
	if (!proposerUserDoc.exists) {
		console.log(`User not found for address : ${proposerSubstrateAddress}`);
		return;
	}

	const proposerUserData = proposerUserDoc.data() as IPAUser;
	if (!proposerUserData.notification_preferences) {
		console.log(`Notification preferences not found for user: ${addressDocData.user_id}`);
		return;
	}

	const proposerNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs(proposerUserData.notification_preferences, network);
	if (!proposerNotificationPreferences) {
		console.log(`Notification preferences not found for user: ${addressDocData.user_id}`);
		return;
	}

	console.log(`Subscribed user for ${TRIGGER_NAME} with id: ${addressDocData.user_id}`);

	const link = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(firestorePostType as EPAProposalType)}/${postId}`;

	const postTypeName = getPostTypeNameFromPostType(firestorePostType as EPAProposalType);

	const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(
		SOURCE,
		TRIGGER_NAME,
		{
			...args,
			username: proposerUserData.username,
			link,
			postType: postTypeName
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

	console.log(`Sending notification to user: ${addressDocData.user_id}`);

	await notificationServiceInstance.notifyAllChannels(proposerNotificationPreferences);
}
