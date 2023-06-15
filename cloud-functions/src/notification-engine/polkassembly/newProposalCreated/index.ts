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

const TRIGGER_NAME = 'newProposalCreated';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string;
	trackId?: string
	proposerAddress: string;
}

export default async function newProposalCreated(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId, proposerAddress, trackId = null } = args;
	const proposerSubstrateAddress = getSubstrateAddress(proposerAddress || '');
	if (!network || !postType || !postId || typeof postId !== 'string' || !proposerAddress || !proposerSubstrateAddress) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const isOpenGovProposal = [EPAProposalType.REFERENDUM_V2, EPAProposalType.FELLOWSHIP_REFERENDUMS].includes(postType as EPAProposalType);

	let SUB_TRIGGER = '';
	switch (postType) {
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

	if (!isOpenGovProposal && !trackId) throw Error(`Missing trackId for trigger: ${TRIGGER_NAME} and sub trigger ${SUB_TRIGGER}`);

	// fetch all users who have newProposalCreated trigger enabled for this network
	const subscribersSnapshot = await firestore_db
		.collection('users')
		.where(`notification_preferences.triggerPreferences.${network}.${SUB_TRIGGER}.enabled`, '==', true)
		.where(`notification_preferences.triggerPreferences.${network}.${SUB_TRIGGER}.${isOpenGovProposal ? 'tracks' : 'post_types'}`, 'array-contains', isOpenGovProposal ? Number(trackId) : postType)
		.get();

	console.log(`Found ${subscribersSnapshot.size} subscribers for SUB_TRIGGER ${SUB_TRIGGER}`);

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

		console.log(`Sending notification to user_id ${subscriberDoc.id} for trigger ${SUB_TRIGGER} on network ${network} for postType ${postType} and postId ${postId}`);
		await notificationServiceInstance.notifyAllChannels(subscriberNotificationPreferences);
	}

	// trigger ownProposalCreated
	await ownProposalCreated({
		network,
		postType,
		postId: String(postId),
		proposerAddress: proposerSubstrateAddress
	});
}
