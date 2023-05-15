import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { IPAUserPreference, EPAProposalType, IPAPostComment, IPAUser, IPACommentReply } from '../_utils/types';
import { paPostsRef, paUserRef } from '../_utils/paFirestoreRefs';
import showdown from 'showdown';
import sendMentionNotifications from '../_utils/sendMentionNotifications';

const TRIGGER_NAME = 'newReplyAdded';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string | number;
	commentId: string | number;
	replyId: string | number;
}

export default async function newReplyAdded(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId, commentId, replyId } = args;

	const postIdNumber = Number(postId);
	const commentIdNumber = Number(commentId);
	const replyIdNumber = Number(replyId);

	if (!network || !postType || !postId || isNaN(postIdNumber) || !commentId || isNaN(commentIdNumber) || !replyId || isNaN(replyIdNumber)) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const commentDoc = await paPostsRef(firestore_db, network, postType as EPAProposalType).doc(String(postId)).collection('comments').doc(String(commentId)).get();
	if (!commentDoc.exists) return;
	const commentDocData = commentDoc.data() as IPAPostComment;
	const commentAuthorDoc = await paUserRef(firestore_db, network, commentDocData.user_id).get();
	if (!commentAuthorDoc.exists) return;
	const commentAuthorData = commentAuthorDoc.data() as IPAUser;

	const replyDoc = await paPostsRef(firestore_db, network, postType as EPAProposalType).doc(String(postId)).collection('comments').doc(String(commentId)).collection('replies').doc(String(replyId)).get();
	if (!replyDoc.exists) return;
	const replyDocData = replyDoc.data() as IPACommentReply;
	const replyAuthorDoc = await paUserRef(firestore_db, network, replyDocData.user_id).get();
	if (!replyAuthorDoc.exists) return;
	const replyAuthorData = replyAuthorDoc.data() as IPAUser;

	const commentUrl = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as EPAProposalType)}/${postId}#${commentId}`;

	const networkRef = firestore_db.collection('networks').doc(network);
	const commentAuthorPreferencesDoc = await networkRef.collection('user_preferences').doc(String(commentAuthorData.id)).get();
	const commentAuthorPreferencesDocData = commentAuthorPreferencesDoc.data() as IPAUserPreference;
	if (!commentAuthorPreferencesDocData || Number(commentAuthorPreferencesDocData.user_id) === Number(replyAuthorData.id)) return; // skip if user replied to his own comment

	const commentAuthorNotificationPreferences: IUserNotificationPreferences = commentAuthorPreferencesDocData.notification_settings;
	if (!commentAuthorNotificationPreferences) return;

	const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
	if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

	const converter = new showdown.Converter();
	const replyHTML = converter.makeHtml(replyDocData.content);

	const subject = triggerTemplate.subject;
	const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
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
		textMessage,
		subject,
		{
			network
		}
	);
	notificationServiceInstance.notifyAllChannels(commentAuthorNotificationPreferences);

	await sendMentionNotifications({
		firestore_db,
		authorUsername: replyAuthorData.username,
		htmlContent: replyHTML,
		network,
		type: 'reply',
		url: commentUrl
	});
}
