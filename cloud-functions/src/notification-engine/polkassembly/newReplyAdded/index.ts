import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EPAProposalType, IPAPostComment, IPAUser, IPACommentReply, EContentType } from '../_utils/types';
import { paPostsRef, paUserRef } from '../_utils/paFirestoreRefs';
import showdown from 'showdown';
import sendMentionNotifications from '../_utils/sendMentionNotifications';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';

const TRIGGER_NAME = 'newReplyAdded';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string;
	commentId: string;
	replyId: string;
}

export default async function newReplyAdded(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId = null, commentId = null, replyId = null } = args;
	if (!network || !postType || !postId || !commentId || !replyId) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	// get comment and comment author data
	const commentDoc = await paPostsRef(firestore_db, network, postType as EPAProposalType).doc(String(postId)).collection('comments').doc(String(commentId)).get();
	if (!commentDoc.exists) return;
	const commentDocData = commentDoc.data() as IPAPostComment;
	const commentAuthorDoc = await paUserRef(firestore_db, commentDocData.user_id).get();
	if (!commentAuthorDoc.exists) return;
	const commentAuthorData = commentAuthorDoc.data() as IPAUser;

	if (!commentAuthorData.notification_preferences) return;

	// get reply and reply author data
	const replyDoc = await paPostsRef(firestore_db, network, postType as EPAProposalType).doc(String(postId)).collection('comments').doc(String(commentId)).collection('replies').doc(String(replyId)).get();
	if (!replyDoc.exists) return;
	const replyDocData = replyDoc.data() as IPACommentReply;
	const replyAuthorDoc = await paUserRef(firestore_db, replyDocData.user_id).get();
	if (!replyAuthorDoc.exists) return;
	const replyAuthorData = replyAuthorDoc.data() as IPAUser;

	const commentUrl = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as EPAProposalType)}/${postId}#${commentId}`;

	if (Number(commentAuthorData.id) === Number(replyAuthorData.id)) return; // skip if user replied to his own comment

	const commentAuthorNotificationPreferences: IUserNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs(commentAuthorData.notification_preferences, network);
	if (!commentAuthorNotificationPreferences) return;

	const converter = new showdown.Converter();
	const replyHTML = converter.makeHtml(replyDocData.content);

	const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(
		SOURCE,
		TRIGGER_NAME,
		{
			...args,
			authorUsername: replyAuthorData.username,
			commentUrl,
			content: replyHTML,
			domain: `https://${network}.polkassembly.io`,
			username: commentAuthorData.username
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
			link: commentUrl
		}
	);
	await notificationServiceInstance.notifyAllChannels(commentAuthorNotificationPreferences);

	await sendMentionNotifications({
		firestore_db,
		authorUsername: replyAuthorData.username,
		htmlContent: replyHTML,
		network,
		type: EContentType.REPLY,
		url: commentUrl
	});
}
