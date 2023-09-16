import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { getSinglePostLinkFromProposalType } from '../_utils/getSinglePostLinkFromProposalType';
import { EContentType, EPAProposalType, IPAPostComment, IPAUser, IPAUserNotificationPreferences } from '../_utils/types';
import { paPostsRef, paUserRef } from '../_utils/paFirestoreRefs';
import showdown from 'showdown';
import sendMentionNotifications from '../_utils/sendMentionNotifications';
import getNetworkNotificationPrefsFromPANotificationPrefs from '../_utils/getNetworkNotificationPrefsFromPANotificationPrefs';
import { INIT_PA_USER_NOTIFICATION_PREFS } from '../_utils/defaults';
import getPostTypeNameFromPostType from '../_utils/getPostTypeNameFromPostType';

const TRIGGER_NAME = 'newCommentAdded';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

interface Args {
	network: string;
	postType: string;
	postId: string;
	commentId: string;
}

export default async function newCommentAdded(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { network, postType, postId = null, commentId = null } = args;

	if (!network || !postType || !postId || !commentId) throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);
	const networkRef = firestore_db.collection('networks').doc(network);

	const postDoc = await networkRef.collection('post_types').doc(postType as EPAProposalType).collection('posts').doc(String(postId)).get();
	const postDocData = postDoc.data();
	if (!postDoc.exists || !postDocData) throw Error(`Post not found for trigger: ${TRIGGER_NAME}`);

	const subscribers: number[] = [...(postDocData?.subscribers || []), postDocData.user_id]; // add post author to subscribers
	if (!subscribers || !subscribers?.length) {
		console.log(`No subscribers for a ${postType} type, post ${postId} on network ${network}`);
		return;
	}

	// get comment author
	const commentDoc = await paPostsRef(firestore_db, network, postType as EPAProposalType).doc(String(postId)).collection('comments').doc(String(commentId)).get();
	if (!commentDoc.exists) throw Error(`Comment not found for trigger: ${TRIGGER_NAME}`);
	const commentDocData = commentDoc.data() as IPAPostComment;
	const commentAuthorDoc = await paUserRef(firestore_db, commentDocData.user_id).get();
	if (!commentAuthorDoc.exists) throw Error(`Comment author not found for trigger: ${TRIGGER_NAME}`);
	const commentAuthorData = commentAuthorDoc.data() as IPAUser;

	const commentUrl = `https://${network}.polkassembly.io/${getSinglePostLinkFromProposalType(postType as EPAProposalType)}/${postId}#${commentId}`;

	const converter = new showdown.Converter();
	const commentHTML = converter.makeHtml(commentDocData.content);

	for (const userId of subscribers) {
		if (userId === commentAuthorData.id) continue;

		const userDoc = await paUserRef(firestore_db, userId).get();
		if (!userDoc.exists) continue;
		const userData = userDoc.data() as IPAUser;
		if (!userData) continue;

		const userPANotificationPreferences: IPAUserNotificationPreferences | null = userData.notification_preferences || null;
		if (!userPANotificationPreferences && userId !== postDocData.user_id) continue; // only skip if user is not the post author

		let userNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs((userPANotificationPreferences || INIT_PA_USER_NOTIFICATION_PREFS), network);

		// send notification to post author even if he hasn't set any notification preferences (or for this trigger)
		if (userId === postDocData.user_id) {
			// only skip if user has explicitly disabled 'commentsOnMyPosts' sub-trigger
			if (userNotificationPreferences.triggerPreferences?.[TRIGGER_NAME]?.enabled === false ||
				!(userNotificationPreferences.triggerPreferences?.[TRIGGER_NAME]?.sub_triggers || ['commentsOnMyPosts']).includes('commentsOnMyPosts')
			) continue;

			// pseudo notification prefs with 'commentsOnMyPosts' sub-trigger enabled (to make default behaviour as enabled)
			userNotificationPreferences = {
				...userNotificationPreferences,
				triggerPreferences: {
					...userNotificationPreferences.triggerPreferences,
					[TRIGGER_NAME]: {
						...userNotificationPreferences.triggerPreferences?.[TRIGGER_NAME],
						enabled: true,
						name: TRIGGER_NAME,
						sub_triggers: ['commentsOnMyPosts']
					}
				}
			};
		}

		const { htmlMessage, markdownMessage, subject, textMessage } = await getTemplateRender(
			SOURCE,
			TRIGGER_NAME,
			{
				...args,
				postType: getPostTypeNameFromPostType(postType as EPAProposalType),
				isPostAuthor: userId === postDocData.user_id,
				authorUsername: commentAuthorData.username,
				commentUrl,
				content: commentHTML,
				domain: `https://${network}.polkassembly.io`,
				username: userData.username
			});

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

		console.log(`Sending notification for trigger: ${TRIGGER_NAME} to user ${userId} on network ${network} for post ${postId} on comment ${commentId}`);
		await notificationServiceInstance.notifyAllChannels(userNotificationPreferences);
	}

	await sendMentionNotifications({
		firestore_db,
		authorUsername: commentAuthorData.username,
		htmlContent: commentHTML,
		network,
		type: EContentType.COMMENT,
		url: commentUrl
	});
}
