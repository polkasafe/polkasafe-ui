import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EPAProposalType, IPAUser } from '../_utils/types';
import getPostTypeNameFromPostType from '../_utils/getPostTypeNameFromPostType';

const TRIGGER_NAME = 'newProposalCreated';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string | number;
}

export default async function newProposalCreated(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId } = args;
	if (!network || !postType || !postId) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	// fetch all users who have newProposalCreated trigger enabled for this network
	const subscribersSnapshot = await firestore_db
		.collection('users')
		.where(`notification_settings.${network}.triggerPreferences.${TRIGGER_NAME}.enabled`, '==', true)
		.get();

	for (const subscriberDoc of subscribersSnapshot.docs) {
		const subscriberData = subscriberDoc.data() as IPAUser;
		const subscriberNotificationPreferences = subscriberData.notification_settings?.[network] || {} as IUserNotificationPreferences;
		if (!subscriberNotificationPreferences) throw Error(`Notification preferences not found for user: ${subscriberData.id}`);

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
