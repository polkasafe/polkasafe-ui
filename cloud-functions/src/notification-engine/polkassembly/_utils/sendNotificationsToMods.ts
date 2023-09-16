import { NotificationService } from '../../NotificationService';
import getTemplateRender from '../../global-utils/getTemplateRender';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getNetworkNotificationPrefsFromPANotificationPrefs from './getNetworkNotificationPrefsFromPANotificationPrefs';
import { EContentType, IPAUser } from './types';

interface Args {
	firestore_db: FirebaseFirestore.Firestore
	contentType: EContentType;
	contentUrl: string;
	authorProfileUrl: string;
	reason: string;
	network: string;
	modProfileUrl: string;
}

const TRIGGER_NAME = 'notifyMods';
const SOURCE = NOTIFICATION_SOURCE.POLKASSEMBLY;

export default async function sendNotificationsToMods(args : Args) {
	if (!args) throw Error(`Missing arguments for trigger: ${TRIGGER_NAME}`);
	const { firestore_db, contentType, contentUrl, authorProfileUrl, modProfileUrl, reason, network } = args;
	console.log(`Running trigger: ${TRIGGER_NAME}, with args: ${JSON.stringify({ contentType, contentUrl, authorProfileUrl, modProfileUrl, reason, network })}`);

	const modUsersSnapshot = await firestore_db.collection('users').where('roles', 'array-contains', 'moderator').get();
	if (modUsersSnapshot.empty) {
		console.log(`No moderators found for trigger: ${TRIGGER_NAME}`);
		return;
	}

	for (const modUserDoc of modUsersSnapshot.docs) {
		// mod-user preferences
		const modUserData = modUserDoc.data() as IPAUser;
		if (!modUserData || !modUserData.notification_preferences) continue;

		const modUserNotificationPrefs = getNetworkNotificationPrefsFromPANotificationPrefs(modUserData.notification_preferences, network);
		if (!modUserNotificationPrefs) continue;

		const { htmlMessage, markdownMessage, textMessage, subject } = await getTemplateRender(
			SOURCE,
			TRIGGER_NAME,
			{
				...args,
				contentType,
				contentUrl,
				authorProfileUrl,
				modProfileUrl,
				reason
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

		console.log(`Sending notification for trigger: ${TRIGGER_NAME}, to user ${modUserData.id}`);
		await notificationServiceInstance.notifyAllChannels(modUserNotificationPrefs);
		return;
	}
}
