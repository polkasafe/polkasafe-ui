import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { thPostRef, thUserRef } from '../_utils/thFirestoreRefs';
import { ETHNotificationTrigger, ETHPostType, ITHPost, ITHUser } from '../_utils/types';
import getHouseNotificationPrefsFromTHNotificationPrefs from '../_utils/getHouseNotificationPrefsFromTHNotificationPrefs';
import { generatePostUrl } from '../_utils/generateUrl';
import { firestore } from 'firebase-admin';

const TRIGGER_NAME = 'newPostCreated';
const SOURCE = NOTIFICATION_SOURCE.TOWNHALL;

interface Args {
	postId: string;
}

export default async function newPostCreated(args: Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { postId } = args;
	if (!postId || typeof postId !== 'string') {
		throw Error(`Invalid arguments for trigger: ${TRIGGER_NAME}`);
	}

	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	// get post
	const postData = (await thPostRef(firestore_db, postId).get()).data() as ITHPost;

	// TODO: get user_id from algolia via proposer_id
	// get author username
	const author = postData.user_id ? ((await thUserRef(firestore_db, postData.user_id).get()).data() as ITHUser) : null;
	const postAuthorUsername = author?.name || !author?.is_username_autogenerated ? author?.username : 'A user has';

	let SUB_TRIGGER = '';
	switch (postData.post_type) {
	case ETHPostType.PROPOSAL:
	case ETHPostType.SNAPSHOT_PROPOSAL:
		SUB_TRIGGER = ETHNotificationTrigger.NEW_OFFCHAIN_PROPOSAL_CREATED;
		break;
	case ETHPostType.ONCHAIN_PROPOSAL:
		SUB_TRIGGER = ETHNotificationTrigger.NEW_ONCHAIN_PROPOSAL_CREATED;
		break;
	case ETHPostType.DISCOURSE_POST:
	case ETHPostType.DISCUSSION:
		SUB_TRIGGER = ETHNotificationTrigger.NEW_DISCUSSION_CREATED;
		break;
	default:
		break;
	}

	if (!SUB_TRIGGER) {
		throw Error(`Invalid post type for trigger: ${TRIGGER_NAME}`);
	}

	const fieldPath = new firestore.FieldPath('notification_preferences', 'triggerPreferences', postData.house_id, SUB_TRIGGER, 'enabled');
	// fetch all users who have newPostCreated trigger enabled for this network
	const subscribersSnapshot = await firestore_db
		.collection('users')
		.where(fieldPath, '==', true)
		.get();

	console.log(`Found ${subscribersSnapshot.size} subscribers for TRIGGER_NAME ${TRIGGER_NAME} and SUB_TRIGGER ${SUB_TRIGGER}`);

	for (const subscriberDoc of subscribersSnapshot.docs) {
		const subscriberData = subscriberDoc.data() as ITHUser;
		if (!subscriberData.notification_preferences) continue;

		console.log(`Subscribed user for ${TRIGGER_NAME} with id: ${subscriberData.id}`);

		const subscriberNotificationPreferences = getHouseNotificationPrefsFromTHNotificationPrefs(
			subscriberData.notification_preferences,
			postData.house_id
		);

		if (!subscriberNotificationPreferences) continue;

		const link = generatePostUrl(postData);

		const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(SOURCE, TRIGGER_NAME, {
			...args,
			username: subscriberData.name || (!subscriberData.is_username_autogenerated ? subscriberData.username : 'user'),
			author_username: postAuthorUsername,
			house_id: postData.house_id,
			proposal_title: postData.title,
			link,
			post_type: (`${postData.post_type}`).replaceAll('_', ' ')
		});

		const notificationServiceInstance = new NotificationService(
			SOURCE,
			SUB_TRIGGER,
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
