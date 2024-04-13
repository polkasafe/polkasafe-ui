import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { thCommentRef, thPostRef, thUserRef } from '../_utils/thFirestoreRefs';
import { EContentType, ITHComment, ITHPost, ITHUser, ITHUserNotificationPreferences } from '../_utils/types';
import getHouseNotificationPrefsFromTHNotificationPrefs from '../_utils/getHouseNotificationPrefsFromTHNotificationPrefs';
import { generatePostUrl } from '../_utils/generateUrl';
import Showdown from 'showdown';
import sendMentionNotifications from '../_utils/sendMentionNotifications';

const TRIGGER_NAME = 'postCommentAdded';
const SOURCE = NOTIFICATION_SOURCE.TOWNHALL;

interface Args {
	comment_id: string;
}

export default async function postCommentAdded(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { comment_id } = args;
	if (!comment_id || typeof comment_id !== 'string') {
		throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);
	}

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	// get comment
	const commentData = (await thCommentRef(firestore_db, comment_id).get()).data() as ITHComment;

	if (!commentData) {
		throw Error(`Comment with id ${comment_id} not found`);
	}

	// get post
	const postId = commentData.post_id;
	const postData = (await thPostRef(firestore_db, postId).get()).data() as ITHPost;

	if (!postData) {
		throw Error(`Post with id ${postId} not found`);
	}

	const subscribers = [...(postData?.subscribers || []), postData.user_id].filter((user_id) => !!user_id) as string[]; // add post author to subscribers
	if (!subscribers || !subscribers?.length) {
		console.log(`No subscribers for a ${postData.post_type} type, post ${postId} in house ${postData?.house_id}.`);
		return;
	}

	// get comment author
	const commentAuthorData = (await thUserRef(firestore_db, commentData.user_id).get()).data() as ITHUser;

	if (!commentAuthorData) {
		throw Error(`Comment author with id ${commentData.user_id} not found`);
	}

	const commentUrl = `${generatePostUrl(postData)}#${comment_id}`;

	const converter = new Showdown.Converter();
	const commentHTML = converter.makeHtml(commentData.content);

	for (const userId of subscribers) {
		if (userId === commentAuthorData.id) continue;

		const userDoc = await thUserRef(firestore_db, userId).get();
		if (!userDoc.exists) continue;
		const userData = userDoc.data() as ITHUser;
		if (!userData) continue;

		const userTHNotificationPreferences: ITHUserNotificationPreferences | null = userData.notification_preferences || null;
		if (!userTHNotificationPreferences && userId !== postData.user_id) continue; // only skip if user is not the post author

		let userNotificationPreferences = getHouseNotificationPrefsFromTHNotificationPrefs(
			userTHNotificationPreferences,
			postData.house_id
		);

		// send notification to post author even if he hasn't set any notification preferences (or for this trigger)
		if (userId === postData.user_id) {
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
		} else {
			// only skip if user has explicitly disabled 'commentsOnSubscribedPosts' sub-trigger
			if (userNotificationPreferences.triggerPreferences?.[TRIGGER_NAME]?.enabled === false ||
				!(userNotificationPreferences.triggerPreferences?.[TRIGGER_NAME]?.sub_triggers || ['commentsOnSubscribedPosts']).includes('commentsOnSubscribedPosts')
			) continue;

			// pseudo notification prefs with 'commentsOnSubscribedPosts' sub-trigger enabled (to make default behaviour as enabled)
			userNotificationPreferences = {
				...userNotificationPreferences,
				triggerPreferences: {
					...userNotificationPreferences.triggerPreferences,
					[TRIGGER_NAME]: {
						...userNotificationPreferences.triggerPreferences?.[TRIGGER_NAME],
						enabled: true,
						name: TRIGGER_NAME,
						sub_triggers: ['commentsOnSubscribedPosts']
					}
				}
			};
		}

		const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(SOURCE, TRIGGER_NAME, {
			...args,
			username: userData.name || !userData.is_username_autogenerated ? userData.username : 'user',
			comment_author: commentAuthorData.name || !commentAuthorData.is_username_autogenerated ? commentAuthorData.username : 'user',
			proposal_title: postData.title,
			link: commentUrl,
			post_type: (`${postData.post_type}`).replaceAll('_', ' '),
			comment: commentHTML
		});

		const notificationServiceInstance = new NotificationService(
			SOURCE,
			TRIGGER_NAME,
			htmlMessage,
			markdownMessage,
			textMessage,
			subject,
			{
				link: commentUrl
			}
		);

		console.log(
			`Sending notification to user_id ${userData.id} for trigger ${TRIGGER_NAME} on house ${postData.house_id} for postId ${postData.id}`
		);
		await notificationServiceInstance.notifyAllChannels(userNotificationPreferences);
	}

	await sendMentionNotifications({
		firestore_db,
		authorUsername: commentAuthorData.username,
		htmlContent: commentHTML,
		house_id: postData.house_id || commentData.house_id,
		type: EContentType.COMMENT,
		url: commentUrl
	});

	return;
}
