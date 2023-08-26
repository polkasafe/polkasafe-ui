import { NotificationService } from '../../NotificationService';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EPAProposalType, IPAUser, IPAUserNotificationPreferences } from '../_utils/types';
import { paUserRef } from '../_utils/paFirestoreRefs';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';
import { INIT_PA_USER_NOTIFICATION_PREFS } from '../_utils/defaults';

const TRIGGER_NAME = 'contentDeletedByMod';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	userId: string;
	commentId: string;
	postId: string;
	replyId: string;
	network: string;
	reason: string;
	postType: string;
}

export default async function contentDeletedByMod(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { userId = '', commentId = '', postId = '', replyId = '', network = '', reason = '', postType = '' } = args;

	if (!userId || isNaN(Number(userId)) || !postId || !network || !reason || !postType) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const contentType = commentId ? 'comment' : replyId ? 'reply' : 'post';

	const contentUrl = replyId && commentId ?
		`https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as EPAProposalType)}/${postId}#${commentId}` :
		`https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as EPAProposalType)}/${postId}`;

	const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(
		SOURCE,
		TRIGGER_NAME,
		{
			...args,
			contentType,
			contentUrl
		}
	);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const contentAuthorDoc = await paUserRef(firestore_db, userId).get();
	if (!contentAuthorDoc.exists) throw Error(`Content author not found for trigger: ${TRIGGER_NAME}`);

	const contentAuthorData = contentAuthorDoc.data() as IPAUser;

	const userPANotificationPreferences: IPAUserNotificationPreferences | null = contentAuthorData.notification_preferences || null;
	if (!userPANotificationPreferences) throw Error(`User notification preferences not found for trigger: ${TRIGGER_NAME}`);

	const userNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs((userPANotificationPreferences || INIT_PA_USER_NOTIFICATION_PREFS), network);

	const notificationServiceInstance = new NotificationService(
		SOURCE,
		TRIGGER_NAME,
		htmlMessage,
		markdownMessage,
		textMessage,
		subject,
		{
			network
		}
	);

	console.log(`Sending notification for trigger: ${TRIGGER_NAME} to user ${userId} on network ${network} for post ${postId}`);
	await notificationServiceInstance.notifyAllChannels(userNotificationPreferences);
}
