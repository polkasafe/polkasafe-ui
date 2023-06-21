import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EPAPostStatusType, EPAProposalType, IPAUser } from '../_utils/types';
import getPostTypeNameFromPostType from '../_utils/getPostTypeNameFromPostType';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';
import subsquidToFirestoreProposalType from '../_utils/subsquidToFirestoreProposalType';
import { networkTrackInfo } from '../_utils/trackInfo';

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
	if (isOpenGovProposal && !track) throw Error(`Missing track for trigger: ${TRIGGER_NAME}`);

	let SUB_TRIGGER = '';
	let trackName = '';
	const tracks = Object.keys(networkTrackInfo[network]);
	if (firestorePostType === EPAProposalType.REFERENDUM_V2) {
		for (const track of tracks) {
			if (networkTrackInfo?.[network]?.[track]?.trackId === Number(track) && !networkTrackInfo?.[network]?.[track]?.fellowshipOrigin) {
				trackName = networkTrackInfo[network][track].name.split('_').map((a:string) => a.charAt(0).toUpperCase()+a.slice(1)).join(' ');
				break;
			}
		}

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
		for (const track of tracks) {
			if (networkTrackInfo?.[network]?.[track]?.trackId === Number(track) && networkTrackInfo?.[network]?.[track]?.fellowshipOrigin) {
				trackName = networkTrackInfo[network][track].name.split('_').map((a:string) => a.charAt(0).toUpperCase()+a.slice(1)).join(' ');
				break;
			}
		}

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

	// fetch all users who have newProposalCreated trigger enabled for this network
	const subscribersSnapshot = await firestore_db
		.collection('users')
		.where(`notification_preferences.triggerPreferences.${network}.${SUB_TRIGGER}.enabled`, '==', true)
		.where(`notification_preferences.triggerPreferences.${network}.${SUB_TRIGGER}.${isOpenGovProposal ? 'tracks' : 'post_types'}`, 'array-contains', isOpenGovProposal ? Number(track) : firestorePostType)
		.get();

	for (const subscriberDoc of subscribersSnapshot.docs) {
		const subscriberData = subscriberDoc.data() as IPAUser;
		if (!subscriberData.notification_preferences) continue;
		const subscriberNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs(subscriberData.notification_preferences, network);
		if (!subscriberNotificationPreferences) continue;

		const link = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(firestorePostType as EPAProposalType)}/${postId}`;

		const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
		if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

		const networkRef = firestore_db.collection('networks').doc(network);

		const postDoc = await networkRef.collection('post_types').doc(postType as EPAProposalType).collection('posts').doc(String(postId)).get();
		const postDocData = postDoc.data();
		const postTypeName = getPostTypeNameFromPostType(firestorePostType as EPAProposalType);

		const subject = triggerTemplate.subject;
		const { htmlMessage, markdownMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
			...args,
			username: subscriberData.username,
			link,
			postType: postTypeName,
			title: postDocData?.title || '',
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

		console.log(`Sending notification to user_id ${subscriberData.id} for trigger ${TRIGGER_NAME} and SUB_TRIGGER ${SUB_TRIGGER} post ${postId}, postType ${firestorePostType}, network ${network}`);
		await notificationServiceInstance.notifyAllChannels(subscriberNotificationPreferences);
	}
}
