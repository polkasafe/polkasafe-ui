import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EPAPostStatus, EPAProposalType, IPAUser } from '../_utils/types';
import getPostTypeNameFromPostType from '../_utils/getPostTypeNameFromPostType';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';

const TRIGGER_NAME = 'proposalStatusChanged';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string;
	newStatus: EPAPostStatus;
	track?: string;
	statusName: string;
}

export default async function proposalStatusChanged(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId, newStatus, track = null, statusName } = args;
	if (!network || !postType || !postId || typeof postId !== 'string' || !newStatus || !statusName) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const isOpenGovProposal = [EPAProposalType.REFERENDUM_V2, EPAProposalType.FELLOWSHIP_REFERENDUMS].includes(postType as EPAProposalType);
	if (isOpenGovProposal && !track) throw Error(`Missing track for trigger: ${TRIGGER_NAME}`);

	let SUB_TRIGGER = '';
	if (postType === EPAProposalType.REFERENDUM_V2) {
		switch (newStatus) {
		case EPAPostStatus.SUBMITTED:
			SUB_TRIGGER = 'openGovReferendumSubmitted';
			break;
		case EPAPostStatus.VOTING:
			SUB_TRIGGER = 'openGovReferendumInVoting';
			break;
		case EPAPostStatus.CLOSED:
			SUB_TRIGGER = 'openGovReferendumClosed';
			break;
		default:
			throw Error(`Invalid status for trigger: ${TRIGGER_NAME}`);
		}
	} else if (postType === EPAProposalType.FELLOWSHIP_REFERENDUMS) {
		switch (newStatus) {
		case EPAPostStatus.SUBMITTED:
			SUB_TRIGGER = 'fellowshipReferendumSubmitted';
			break;
		case EPAPostStatus.VOTING:
			SUB_TRIGGER = 'fellowshipReferendumInVoting';
			break;
		case EPAPostStatus.CLOSED:
			SUB_TRIGGER = 'fellowshipReferendumClosed';
			break;
		default:
			throw Error(`Invalid status for trigger: ${TRIGGER_NAME}`);
		}
	} else {
		switch (newStatus) {
		case EPAPostStatus.SUBMITTED:
			SUB_TRIGGER = 'gov1ProposalSubmitted';
			break;
		case EPAPostStatus.VOTING:
			SUB_TRIGGER = 'gov1ProposalInVoting';
			break;
		case EPAPostStatus.CLOSED:
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
		.where(`notification_preferences.triggerPreferences.${network}.${SUB_TRIGGER}.${isOpenGovProposal ? 'tracks' : 'post_types'}`, 'array-contains', isOpenGovProposal ? Number(track) : postType)
		.get();

	for (const subscriberDoc of subscribersSnapshot.docs) {
		const subscriberData = subscriberDoc.data() as IPAUser;
		if (!subscriberData.notification_preferences) continue;
		const subscriberNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs(subscriberData.notification_preferences, network);
		if (!subscriberNotificationPreferences) continue;

		const link = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as EPAProposalType)}/${postId}`;

		const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
		if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

		const postTypeName = getPostTypeNameFromPostType(postType as EPAProposalType);

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

		console.log(`Sending notification to user_id ${subscriberData.id} for trigger ${TRIGGER_NAME} and SUB_TRIGGER ${SUB_TRIGGER} post ${postId}, postType ${postType}, network ${network}`);
		await notificationServiceInstance.notifyAllChannels(subscriberNotificationPreferences);
	}
}
