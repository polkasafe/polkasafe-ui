import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { thCommentRef, thPostRef, thUserRef } from '../_utils/thFirestoreRefs';
import { ITHComment, ITHUser } from '../_utils/types';
import getHouseNotificationPrefsFromTHNotificationPrefs from '../_utils/getHouseNotificationPrefsFromTHNotificationPrefs';

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
	const postData = (await thPostRef(firestore_db, postId).get()).data();

	if (!postData) {
		throw Error(`Post with id ${postId} not found`);
	}

	// get comment author
	const commentAuthorData = (await thUserRef(firestore_db, commentData.user_id).get()).data() as ITHUser;

	if (!commentAuthorData) {
		throw Error(`Comment author with id ${commentData.user_id} not found`);
	}

	// fetch all users who have newPostCreated trigger enabled for this network
	const subscribersSnapshot = await firestore_db
		.collection('users')
		.where(`notification_preferences.triggerPreferences.${postData.house_id}.${TRIGGER_NAME}.enabled`, '==', true)
		.get();

	console.log(`Found ${subscribersSnapshot.size} subscribers for TRIGGER_NAME ${TRIGGER_NAME}`);

	for (const subscriberDoc of subscribersSnapshot.docs) {
		const subscriberData = subscriberDoc.data() as ITHUser;
		if (!subscriberData.notification_preferences) continue;

		console.log(`Subscribed user for ${TRIGGER_NAME} with id: ${subscriberData.id}`);

		const subscriberNotificationPreferences = getHouseNotificationPrefsFromTHNotificationPrefs(
			subscriberData.notification_preferences,
			postData.house_id
		);

		if (!subscriberNotificationPreferences) continue;

		const link = `https://www.townhallgov.com/${postData.house_id}/post/${postId}`;

		const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(SOURCE, TRIGGER_NAME, {
			...args,
			username: subscriberData.name || !subscriberData.is_username_autogenerated ? subscriberData.username : 'user',
			comment_author: commentAuthorData.name || !commentAuthorData.is_username_autogenerated ? commentAuthorData.username : 'user',
			proposal_title: postData.title,
			link,
			post_type: (`${postData.post_type}`).replaceAll('_', ' '),
			comment: commentData.content
		});

		const notificationServiceInstance = new NotificationService(
			SOURCE,
			TRIGGER_NAME,
			htmlMessage,
			markdownMessage,
			textMessage,
			subject,
			{
				link
			}
		);

		console.log(
			`Sending notification to user_id ${subscriberDoc.id} for trigger ${TRIGGER_NAME} on house ${postData.house_id} for postId ${postData.id}`
		);
		await notificationServiceInstance.notifyAllChannels(subscriberNotificationPreferences);
	}

	return;
}
