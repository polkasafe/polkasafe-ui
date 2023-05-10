import { NotificationService } from '../../NotificationService';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { IUserNotificationPreferences, NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getMentionedUsernames from './getMentionedUsernames';
import { IPAUser, IPAUserPreference } from './types';

interface Args {
	firestore_db: FirebaseFirestore.Firestore
	authorUsername: string | number;
	htmlContent: string;
	network: string;
	type: 'comment' | 'post' | 'reply';
	url: string;
}

const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

export default async function sendMentionNotifications({ firestore_db, authorUsername, htmlContent, network, type, url } : Args) {
	const mentionedUsernames = getMentionedUsernames(htmlContent).filter((username) => username !== authorUsername);
	if (!mentionedUsernames.length) return;

	const networkRef = firestore_db.collection('networks').doc(network);

	let TRIGGER_NAME = '';
	switch (type) {
	case 'comment':
		TRIGGER_NAME = 'newMentionInComment';
		break;
	case 'post':
		TRIGGER_NAME = 'newMentionInPost';
		break;
	case 'reply':
		TRIGGER_NAME = 'newMentionInReply';
		break;
	}
	if (!TRIGGER_NAME) throw Error(`Invalid type: ${type}`);

	const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
	if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);

	for (const mentionedUsername of mentionedUsernames) {
		// get user preferences
		const mentionedUserDoc = await firestore_db.collection('users').where('username', '==', mentionedUsername).limit(1).get();
		if (mentionedUserDoc.empty) continue;
		const mentionedUserData = mentionedUserDoc.docs[0].data() as IPAUser;
		const mentionedUserPreferencesDoc = await networkRef.collection('user_preferences').doc(String(mentionedUserData.id)).get();
		if (!mentionedUserPreferencesDoc.exists) continue;
		const mentionedUserPreferences = mentionedUserPreferencesDoc.data() as IPAUserPreference;
		const mentionedUserNotificationPreferences: IUserNotificationPreferences = mentionedUserPreferences.notification_settings;
		if (!mentionedUserNotificationPreferences) continue;

		const subject = triggerTemplate.subject;
		const { htmlMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
			authorUsername,
			url,
			content: htmlContent,
			domain: `https://${network}.polkassembly.io`,
			mentionedUsername
		});

		const notificationServiceInstance = new NotificationService(
			SOURCE,
			TRIGGER_NAME,
			mentionedUserNotificationPreferences,
			htmlMessage,
			textMessage,
			subject,
			{
				network
			}
		);
		notificationServiceInstance.notifyAllChannels();
	}
}
