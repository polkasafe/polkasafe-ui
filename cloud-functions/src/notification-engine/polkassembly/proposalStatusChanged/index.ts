import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EPAPostStatusType, EPAProposalType, IPAUser } from '../_utils/types';
import getPostTypeNameFromPostType from '../_utils/getPostTypeNameFromPostType';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';
import subsquidToFirestoreProposalType from '../_utils/subsquidToFirestoreProposalType';
import { getTrackName } from '../_utils/getTrackName';

const TRIGGER_NAME = 'proposalStatusChanged';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string;
	statusType : EPAPostStatusType;
	track?: string;
	statusName: string;
}

export default async function proposalStatusChanged(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId, statusType, track = null, statusName } = args;
	if (!network || !postType || !postId || typeof postId !== 'string' || !statusType || !statusName) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const firestorePostType = subsquidToFirestoreProposalType(postType);
	if (!firestorePostType) throw Error(`Invalid postType for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const isOpenGovProposal = [EPAProposalType.REFERENDUM_V2, EPAProposalType.FELLOWSHIP_REFERENDUMS].includes(firestorePostType as EPAProposalType);
	const isPip = [EPAProposalType.COMMUNITY_PIPS, EPAProposalType.TECHNICAL_PIPS, EPAProposalType.UPGRADE_PIPS].includes(firestorePostType as EPAProposalType);

	if (isOpenGovProposal && !track) throw Error(`Missing track for trigger: ${TRIGGER_NAME}`);

	let SUB_TRIGGER = '';
	let trackName = '';
	if (firestorePostType === EPAProposalType.REFERENDUM_V2) {
		trackName = getTrackName(network, Number(track), false);

		switch (statusType) {
		case EPAPostStatusType.SUBMITTED:
			SUB_TRIGGER = 'openGovReferendumSubmitted';
			break;
		case EPAPostStatusType.VOTING:
			SUB_TRIGGER = 'openGovReferendumInVoting';
			break;
		case EPAPostStatusType.CLOSED:
			SUB_TRIGGER = 'openGovReferendumClosed';
			break;
		default:
			throw Error(`Invalid status for trigger: ${TRIGGER_NAME}`);
		}
	} else if (firestorePostType === EPAProposalType.FELLOWSHIP_REFERENDUMS) {
		trackName = getTrackName(network, Number(track), true);

		switch (statusType) {
		case EPAPostStatusType.SUBMITTED:
			SUB_TRIGGER = 'fellowshipReferendumSubmitted';
			break;
		case EPAPostStatusType.VOTING:
			SUB_TRIGGER = 'fellowshipReferendumInVoting';
			break;
		case EPAPostStatusType.CLOSED:
			SUB_TRIGGER = 'fellowshipReferendumClosed';
			break;
		default:
			throw Error(`Invalid status for trigger: ${TRIGGER_NAME}`);
		}
	} else if (isPip) {
		switch (statusType) {
		case EPAPostStatusType.SUBMITTED:
			SUB_TRIGGER = 'pipSubmitted';
			break;
		case EPAPostStatusType.VOTING:
			SUB_TRIGGER = 'pipInVoting';
			break;
		case EPAPostStatusType.CLOSED:
			SUB_TRIGGER = 'pipClosed';
			break;
		default:
			throw Error(`Invalid status for trigger: ${TRIGGER_NAME}`);
		}
	} else {
		switch (statusType) {
		case EPAPostStatusType.SUBMITTED:
			SUB_TRIGGER = 'gov1ProposalSubmitted';
			break;
		case EPAPostStatusType.VOTING:
			SUB_TRIGGER = 'gov1ProposalInVoting';
			break;
		case EPAPostStatusType.CLOSED:
			SUB_TRIGGER = 'gov1ProposalClosed';
			break;
		default:
			throw Error(`Invalid status for trigger: ${TRIGGER_NAME}`);
		}
	}

	const subTriggerKey = isOpenGovProposal ? 'tracks' : isPip ? 'pip_types' : 'post_types';

	// fetch all users who have newProposalCreated trigger enabled for this network
	const subscribersSnapshot = await firestore_db
		.collection('users')
		.where(`notification_preferences.triggerPreferences.${network}.${SUB_TRIGGER}.enabled`, '==', true)
		.where(`notification_preferences.triggerPreferences.${network}.${SUB_TRIGGER}.${subTriggerKey}`, 'array-contains', isOpenGovProposal ? Number(track) : firestorePostType)
		.get();

	console.log(`Found ${subscribersSnapshot.size} subscribers for SUB_TRIGGER ${SUB_TRIGGER}`);

	for (const subscriberDoc of subscribersSnapshot.docs) {
		const subscriberData = subscriberDoc.data() as IPAUser;
		if (!subscriberData.notification_preferences) continue;

		console.log(`Subscribed user for ${SUB_TRIGGER} with id: ${subscriberData.id}`);

		const subscriberNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs(subscriberData.notification_preferences, network);
		if (!subscriberNotificationPreferences) continue;

		const link = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(firestorePostType as EPAProposalType)}/${postId}`;

		const networkRef = firestore_db.collection('networks').doc(network);

		const postDoc = await networkRef.collection('post_types').doc(firestorePostType as EPAProposalType).collection('posts').doc(String(postId)).get();
		const postDocData = postDoc.data();
		const postTypeName = getPostTypeNameFromPostType(firestorePostType as EPAProposalType);

		const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(
			SOURCE,
			TRIGGER_NAME,
			{
				...args,
				username: subscriberData.username,
				link,
				postType: postTypeName,
				title: postDocData?.title || 'Untitled',
				track: trackName
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

		console.log(`Sending notification to user_id ${subscriberData.id} for trigger ${TRIGGER_NAME} and SUB_TRIGGER ${SUB_TRIGGER}, post ${postId}, postType ${firestorePostType}, network ${network} and status ${statusName}`);
		await notificationServiceInstance.notifyAllChannels(subscriberNotificationPreferences);
	}

	return;
}
