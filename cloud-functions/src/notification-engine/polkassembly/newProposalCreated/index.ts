import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EPAProposalType, IPAUser } from '../_utils/types';
import getPostTypeNameFromPostType from '../_utils/getPostTypeNameFromPostType';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';
import ownProposalCreated from '../ownProposalCreated';
import getSubstrateAddress from '../../global-utils/getSubstrateAddress';
import subsquidToFirestoreProposalType from '../_utils/subsquidToFirestoreProposalType';

const TRIGGER_NAME = 'newProposalCreated';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string;
	track?: string
	proposerAddress: string;
}

export default async function newProposalCreated(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId, proposerAddress, track = null } = args;
	const proposerSubstrateAddress = getSubstrateAddress(proposerAddress || '');
	if (!network || !postType || !postId || typeof postId !== 'string' || !proposerAddress || !proposerSubstrateAddress) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const firestorePostType = subsquidToFirestoreProposalType(postType);
	if (!firestorePostType) throw Error(`Invalid postType for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const isOpenGovProposal = [EPAProposalType.REFERENDUM_V2, EPAProposalType.FELLOWSHIP_REFERENDUMS].includes(firestorePostType as EPAProposalType);

	let SUB_TRIGGER = '';
	switch (firestorePostType) {
	case EPAProposalType.REFERENDUM_V2:
		SUB_TRIGGER = 'openGovReferendumSubmitted';
		break;
	case EPAProposalType.FELLOWSHIP_REFERENDUMS:
		SUB_TRIGGER = 'fellowshipReferendumSubmitted';
		break;
	default:
		SUB_TRIGGER = 'gov1ProposalSubmitted';
		break;
	}

	if (isOpenGovProposal && !track) throw Error(`Missing track for trigger: ${TRIGGER_NAME} and sub trigger ${SUB_TRIGGER}`);

	// fetch all users who have newProposalCreated trigger enabled for this network
	const subscribersSnapshot = await firestore_db
		.collection('users')
		.where(`notification_preferences.triggerPreferences.${network}.${SUB_TRIGGER}.enabled`, '==', true)
		.where(`notification_preferences.triggerPreferences.${network}.${SUB_TRIGGER}.${isOpenGovProposal ? 'tracks' : 'post_types'}`, 'array-contains', isOpenGovProposal ? Number(track) : firestorePostType)
		.get();

	console.log(`Found ${subscribersSnapshot.size} subscribers for SUB_TRIGGER ${SUB_TRIGGER}`);

	for (const subscriberDoc of subscribersSnapshot.docs) {
		const subscriberData = subscriberDoc.data() as IPAUser;
		if (!subscriberData.notification_preferences) continue;

		console.log(`Subscribed user for ${SUB_TRIGGER} with id: ${subscriberData.id}`);

		const subscriberNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs(subscriberData.notification_preferences, network);
		if (!subscriberNotificationPreferences) continue;

		const link = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(firestorePostType as EPAProposalType)}/${postId}`;

		const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
		if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

		const postTypeName = getPostTypeNameFromPostType(firestorePostType as EPAProposalType);

		const subject = triggerTemplate.subject;
		const { htmlMessage, markdownMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
			...args,
			username: subscriberData.username,
			link,
			postType: postTypeName
		});

		const notificationServiceInstance = new NotificationService(
			SOURCE,
			SUB_TRIGGER,
			htmlMessage,
			markdownMessage,
			textMessage,
			subject,
			{
				network,
				link
			}
		);

		console.log(`Sending notification to user_id ${subscriberDoc.id} for trigger ${SUB_TRIGGER} on network ${network} for postType ${firestorePostType} and postId ${postId}`);
		await notificationServiceInstance.notifyAllChannels(subscriberNotificationPreferences);
	}

	await ownProposalCreated({
		network,
		postType,
		postId: String(postId),
		proposerAddress: proposerSubstrateAddress
	});
}
