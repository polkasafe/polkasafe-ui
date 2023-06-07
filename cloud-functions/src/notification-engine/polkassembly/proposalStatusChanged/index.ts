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
	track?: number
}

export default async function proposalStatusChanged(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId, newStatus, track = null } = args;
	if (!network || !postType || !postId || typeof postId !== 'string' || !newStatus) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	let SUB_TRIGGER = '';
	if ([EPAProposalType.REFERENDUM_V2, EPAProposalType.FELLOWSHIP_REFERENDUMS].includes(postType as EPAProposalType)) {
		if (!track) throw Error(`Missing track for trigger: ${TRIGGER_NAME}`);

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
		.where(`notification_settings.${network}.triggerPreferences.${SUB_TRIGGER}.enabled`, '==', true)
		.where(`notification_settings.${network}.triggerPreferences.${SUB_TRIGGER}.${SUB_TRIGGER.startsWith('openGov') ? 'tracks' : 'post_types'}`, 'array-contains', SUB_TRIGGER.startsWith('openGov') ? track : postType)
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
		const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
			...args,
			username: subscriberData.username,
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
		await notificationServiceInstance.notifyAllChannels(subscriberNotificationPreferences);
	}
}
