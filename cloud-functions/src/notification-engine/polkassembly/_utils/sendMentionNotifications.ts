import { NotificationService } from '../../NotificationService';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getMentionedUsernames from './getMentionedUsernames';
import getNetworkNotificationPrefsFromPANotificationPrefs from './getNetworkNotificationPrefsFromPANotificationPrefs';
import { EMentionType, IPAUser } from './types';

interface Args {
	firestore_db: FirebaseFirestore.Firestore
	authorUsername: string | number;
	htmlContent: string;
	network: string;
	type: EMentionType;
	url: string;
}

const TRIGGER_NAME = 'newMention';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

export default async function sendMentionNotifications(args : Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { firestore_db, authorUsername, htmlContent, network, type, url } = args;
	console.log(`Running trigger: ${TRIGGER_NAME}, with args: ${JSON.stringify({ authorUsername, htmlContent, network, type, url })}`);

	const mentionedUsernames = getMentionedUsernames(htmlContent).filter((username) => username !== authorUsername);
	console.log(`Mentioned usernames: ${JSON.stringify(mentionedUsernames)}`);
	if (!mentionedUsernames.length) return;

	const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
	if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

	for (const mentionedUsername of mentionedUsernames) {
		// get user preferences
		const mentionedUserDocSnapshot = await firestore_db.collection('users').where('username', '==', mentionedUsername).limit(1).get();
		if (mentionedUserDocSnapshot.empty) continue;

		const mentionedUserData = mentionedUserDocSnapshot.docs[0].data() as IPAUser;
		if (!mentionedUserData || !mentionedUserData.notification_preferences) continue;

		const mentionedUserNotificationPreferences = getNetworkNotificationPrefsFromPANotificationPrefs(mentionedUserData.notification_preferences, network);
		if (!mentionedUserNotificationPreferences) continue;

		if (!(mentionedUserNotificationPreferences.triggerPreferences?.[TRIGGER_NAME]?.mention_types || []).includes(type)) continue;

		const subject = triggerTemplate.subject;
		const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
			...args,
			authorUsername,
			url,
			content: htmlContent,
			domain: `https://${network}.polkassembly.io`,
			username: mentionedUsername,
			mentionType: type
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

		console.log(`Sending notification for trigger: ${TRIGGER_NAME}, mention type: ${type} by user ${mentionedUserData.id}`);
		await notificationServiceInstance.notifyAllChannels(mentionedUserNotificationPreferences);
	}
}
