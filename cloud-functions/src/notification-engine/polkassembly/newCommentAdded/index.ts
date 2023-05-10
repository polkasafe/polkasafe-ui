import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { IPAUserPreference, EPAProposalType, IPAPostComment, IPAUser } from '../_utils/types';
import { paPostsRef, paUserRef } from '../_utils/paFirestoreRefs';
import showdown from 'showdown';
import sendMentionNotifications from '../_utils/sendMentionNotifications';

const TRIGGER_NAME = 'newCommentAdded';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string | number;
	commentId: string | number
}

export default async function newCommentAdded(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId, commentId } = args;

	const postIdNumber = Number(postId);
	const commentIdNumber = Number(commentId);

	if (!network || !postType || !postId || isNaN(postIdNumber) || !commentId || isNaN(commentIdNumber)) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);
	const networkRef = firestore_db.collection('networks').doc(network);

	const postSubcribersSnapshot = await networkRef.collection('user_preferences')
		.where(`post_subscriptions.${postType}`, 'array-contains', String(postId))
		.get();

	if (postSubcribersSnapshot.empty) return;

	const commentDoc = await paPostsRef(firestore_db, network, postType as EPAProposalType).doc(String(postId)).collection('comments').doc(String(commentId)).get();
	if (!commentDoc.exists) return;
	const commentDocData = commentDoc.data() as IPAPostComment;

	const commentAuthorDoc = await paUserRef(firestore_db, network, commentDocData.user_id).get();
	if (!commentAuthorDoc.exists) return;

	const commentAuthorData = commentAuthorDoc.data() as IPAUser;
	const commentUrl = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as EPAProposalType)}/${postId}#${commentId}`;

	const converter = new showdown.Converter();
	const commentHTML = converter.makeHtml(commentDocData.content);

	for (const doc of postSubcribersSnapshot.docs) {
		const userPreferenceDocData = doc.data() as IPAUserPreference;
		if (!userPreferenceDocData || Number(userPreferenceDocData.user_id) === Number(commentDocData.user_id)) continue; // skip if subscriber is comment author

		const userDoc = await paUserRef(firestore_db, network, userPreferenceDocData.user_id).get();
		if (!userDoc.exists) continue;
		const userData = userDoc.data() as IPAUser;

		const userNotificationPreferences: IUserNotificationPreferences = userPreferenceDocData.notification_settings;
		if (!userNotificationPreferences) continue;

		const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
		if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

		const subject = triggerTemplate.subject;
		const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
			...args,
			authorUsername: commentAuthorData.username,
			commentUrl,
			content: commentHTML,
			domain: `https://${network}.polkassembly.io`,
			username: userData.username
		});

		const notificationServiceInstance = new NotificationService(
			SOURCE,
			TRIGGER_NAME,
			userNotificationPreferences,
			htmlMessage,
			textMessage,
			subject,
			{
				network
			}
		);
		notificationServiceInstance.notifyAllChannels();
	}

	await sendMentionNotifications({
		firestore_db,
		authorUsername: commentAuthorData.username,
		htmlContent: commentHTML,
		network,
		type: 'comment',
		url: commentUrl
	});
}
