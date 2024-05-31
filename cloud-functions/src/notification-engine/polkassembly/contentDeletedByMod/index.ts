import { NotificationService } from '../../NotificationService';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EContentType, EPAProposalType, IPAUser, IPAUserNotificationPreferences } from '../_utils/types';
import { paPostsRef, paUserRef } from '../_utils/paFirestoreRefs';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';
import { INIT_PA_USER_NOTIFICATION_PREFS } from '../_utils/defaults';
import sendNotificationsToMods from '../_utils/sendNotificationsToMods';

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

	if (isNaN(Number(userId)) || isNaN(Number(postId)) || !network || !reason || !postType) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const contentType: EContentType = commentId ? EContentType.COMMENT : replyId ? EContentType.REPLY : EContentType.POST;

	const contentUrl = commentId ?
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

	const modUserDoc = await paUserRef(firestore_db, userId).get();
	const modUserData = modUserDoc.data() as IPAUser;
	if (!modUserData) throw Error(`Mod author not found for trigger: ${TRIGGER_NAME}`);

	// get content doc for author
	let contentRef = paPostsRef(firestore_db, network, postType as EPAProposalType).doc(String(postId));
	if (commentId) contentRef = contentRef.collection('comments').doc(String(commentId));
	if (replyId) contentRef = contentRef.collection('replies').doc(String(replyId));
	const contentDoc = await contentRef.get();

	const contentAuthorId = contentDoc.data()?.user_id;
	if (isNaN(contentAuthorId)) throw Error(`Content author not found in content document for trigger: ${TRIGGER_NAME}`);

	const contentAuthorDoc = await paUserRef(firestore_db, Number(contentAuthorId)).get();
	if (!contentAuthorDoc.exists) throw Error(`Content author not found for trigger: ${TRIGGER_NAME}`);
	const contentAuthorData = contentAuthorDoc.data() as IPAUser;

	const userPANotificationPreferences: IPAUserNotificationPreferences = contentAuthorData.notification_preferences || INIT_PA_USER_NOTIFICATION_PREFS;
	if (!userPANotificationPreferences) throw Error(`User notification preferences not found for trigger: ${TRIGGER_NAME}`);

	let userNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs((userPANotificationPreferences), network);

	// pseudo notification prefs with 'contentDeletedByMod' (to make default behaviour as enabled)
	userNotificationPreferences = {
		...userNotificationPreferences,
		triggerPreferences: {
			...userNotificationPreferences.triggerPreferences,
			[TRIGGER_NAME]: {
				...userNotificationPreferences.triggerPreferences?.[TRIGGER_NAME],
				enabled: true,
				name: TRIGGER_NAME
			}
		}
	};

	const notificationServiceInstance = new NotificationService(
		SOURCE,
		TRIGGER_NAME,
		htmlMessage,
		markdownMessage,
		textMessage,
		subject,
		{
			network,
			link: contentUrl
		}
	);

	console.log(`Sending notification for trigger: ${TRIGGER_NAME} to user ${userId} on network ${network} for post ${postId}`);
	await notificationServiceInstance.notifyAllChannels(userNotificationPreferences);

	await sendNotificationsToMods({
		firestore_db,
		contentType,
		contentUrl,
		authorProfileUrl: `https://${network}.polkassembly.io/user/${contentAuthorData.username}`,
		modProfileUrl: `https://${network}.polkassembly.io/user/${modUserData.username}`,
		reason,
		network
	});
	return;
}
