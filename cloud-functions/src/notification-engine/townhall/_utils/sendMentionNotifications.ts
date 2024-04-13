import { NotificationService } from '../../NotificationService';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getHouseNotificationPrefsFromTHNotificationPrefs from './getHouseNotificationPrefsFromTHNotificationPrefs';
import getMentionedUsernames from './getMentionedUsernames';
import { EContentType, ITHUser } from './types';

interface Args {
	firestore_db: FirebaseFirestore.Firestore
	authorUsername: string | null;
	htmlContent: string;
	house_id: string;
	type: EContentType;
	url: string;
}

const TRIGGER_NAME = 'newMention';
const SOURCE = NOTIFICATION_SOURCE.TOWNHALL;

export default async function sendMentionNotifications(args : Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { firestore_db, authorUsername, htmlContent, house_id, type, url } = args;
	console.log(`Running trigger: ${TRIGGER_NAME}, with args: ${JSON.stringify({ authorUsername, htmlContent, house_id, type, url })}`);

	const mentionedUsernames = getMentionedUsernames(htmlContent).filter((username) => username !== authorUsername);
	console.log(`Mentioned usernames: ${JSON.stringify(mentionedUsernames)}`);
	if (!mentionedUsernames.length) return;

	for (const mentionedUsername of mentionedUsernames) {
		// get user preferences
		const mentionedUserDocSnapshot = await firestore_db.collection('users').where('username', '==', mentionedUsername).limit(1).get();
		if (mentionedUserDocSnapshot.empty) continue;

		const mentionedUserData = mentionedUserDocSnapshot.docs[0].data() as ITHUser;
		if (!mentionedUserData || !mentionedUserData.notification_preferences) continue;

		const mentionedUserNotificationPreferences = getHouseNotificationPrefsFromTHNotificationPrefs(mentionedUserData.notification_preferences, house_id);
		if (!mentionedUserNotificationPreferences) continue;

		if (!mentionedUserNotificationPreferences.triggerPreferences?.[TRIGGER_NAME].enabled || !(mentionedUserNotificationPreferences.triggerPreferences?.[TRIGGER_NAME]?.mention_types || []).includes(type)) continue;

		let domain = '';
		try {
			const urlObject = new URL(url);
			domain = urlObject.origin; // This gets the protocol + hostname + port (if any)
		} catch (error) {
			console.error('Invalid URL: ', error);
		}

		const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(
			SOURCE,
			TRIGGER_NAME,
			{
				...args,
				authorUsername,
				url,
				content: htmlContent,
				domain: domain,
				username: mentionedUsername,
				mentionType: type
			});

		const notificationServiceInstance = new NotificationService(
			SOURCE,
			TRIGGER_NAME,
			htmlMessage,
			markdownMessage,
			textMessage,
			subject,
			{
				link: url
			}
		);

		console.log(`Sending notification for trigger: ${TRIGGER_NAME}, mention type: ${type} by user ${mentionedUserData.id}`);
		await notificationServiceInstance.notifyAllChannels(mentionedUserNotificationPreferences);
	}
}
