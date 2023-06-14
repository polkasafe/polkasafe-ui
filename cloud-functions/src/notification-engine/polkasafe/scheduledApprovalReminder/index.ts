import { NotificationService } from '../../NotificationService';
import getSourceFirebaseAdmin from '../../global-utils/getSourceFirebaseAdmin';
import { NOTIFICATION_SOURCE } from '../../notification_engine_constants';
import getTemplateRender from '../../global-utils/getTemplateRender';
import getTriggerTemplate from '../../global-utils/getTriggerTemplate';
import { IPSMultisigAddress, IPSMultisigSettings, IPSUser } from '../_utils/types';
import { Timestamp as FirestoreTimestamp } from 'firebase-admin/firestore';
import getMultisigQueueByAddress from '../../../utlils/getMultisigQueueByAddress';
import { IQueueItem } from '../../../types';

const TRIGGER_NAME = 'scheduledApprovalReminder';
const SOURCE = NOTIFICATION_SOURCE.POLKASAFE;

interface IMultisigQueueResponse {
	error?: string | null;
	data: IQueueItem[];
}

export default async function scheduledApprovalReminder() {
	const { firestore_db } = getSourceFirebaseAdmin(SOURCE);

	const triggerTemplate = await getTriggerTemplate(firestore_db, SOURCE, TRIGGER_NAME);
	if (!triggerTemplate) throw Error(`Template not found for trigger: ${TRIGGER_NAME}`);
	const subject = triggerTemplate.subject;

	// 1. fetch all users who have this trigger enabled
	const usersSnapshot = await firestore_db.collection('addresses').where(`notification_preferences.triggerPreferences.${TRIGGER_NAME}.enabled`, '==', true).get();

	// 2. addressesToNotify : if last notified time doesn't exist or is > x hours (saved with the trigger preferences)
	const addressesToNotify: IPSUser[] = [];
	for (const userAddressDoc of usersSnapshot.docs) {
		const { notification_preferences = null } = userAddressDoc.data() as IPSUser;
		if (!notification_preferences) continue;

		const { lastNotified = null } = notification_preferences.triggerPreferences[TRIGGER_NAME];
		// if no valid lastNotified time then notify
		if (!lastNotified || !(lastNotified instanceof FirestoreTimestamp) || !(lastNotified?.toDate() instanceof Date)) {
			addressesToNotify.push(userAddressDoc.data() as IPSUser);
			continue;
		}

		const hoursSinceLastNotified = (new Date().getTime() - new Date(lastNotified.toDate()).getTime()) / (1000 * 60 * 60);
		// min value for hoursToRemindIn is 8
		const { hoursToRemindIn = 8 } = notification_preferences.triggerPreferences[TRIGGER_NAME];

		if (hoursSinceLastNotified >= hoursToRemindIn) {
			addressesToNotify.push(userAddressDoc.data() as IPSUser);
		}
	}

	// 3. fetch all multisig addresses for addressesToNotify
	for (const userAddressDoc of addressesToNotify) {
		if (!userAddressDoc.notification_preferences) continue;

		const multisigAddressSnapshot = await firestore_db.collection('multisigAddresses').where('signatories', 'array-contains', userAddressDoc.address).get();

		// multisig addresses that aren't disabled or deleted for this user
		const multisigAddressesToNotifyForUser: IPSMultisigAddress[] = [];
		for (const multisigAddressDoc of multisigAddressSnapshot.docs) {
			const { multisigSettings = null } = userAddressDoc;
			if ((multisigSettings?.[multisigAddressDoc.id] as IPSMultisigSettings)?.deleted) continue;

			const multisigAddressData = multisigAddressDoc.data() as IPSMultisigAddress;
			if (multisigAddressData?.disabled) continue;

			multisigAddressesToNotifyForUser.push(multisigAddressData);
		}

		const pendingTxMultisigs: {
			multisigName: string;
			multisigAddress: string;
			network: string;
		}[] = [];

		// 4. fetch active multisig transactions for multisig addresses
		const multisigQueuePromises: Promise<any>[] = [];
		multisigAddressesToNotifyForUser.forEach((multisigAddressData) => multisigQueuePromises.push(getMultisigQueueByAddress(multisigAddressData.address, multisigAddressData.network, 1, 1, firestore_db)));

		const multisigQueueResults = await Promise.allSettled(multisigQueuePromises);
		for (const [index, multisigAddressResult] of multisigQueueResults.entries()) {
			// if there are any multisig transactions, send a single notification for all of them
			if (multisigAddressResult.status !== 'fulfilled' || !multisigAddressResult.value) continue;
			const { data, error } = multisigAddressResult.value as IMultisigQueueResponse;
			if (error || !data || !data.length) continue;

			const multisigAddressData = multisigAddressesToNotifyForUser[index];

			pendingTxMultisigs.push({
				multisigName: userAddressDoc.multisigSettings?.[multisigAddressData.address]?.name || multisigAddressData?.name || 'Untitled Multisig',
				multisigAddress: multisigAddressData.address,
				network: multisigAddressData.network
			});
		}

		// 5. send notifications for all multisigs in a single notification
		const { htmlMessage, markdownMessage, textMessage } = getTemplateRender(triggerTemplate.template, {
			multisigDataArr: pendingTxMultisigs
		});

		const notificationServiceInstance = new NotificationService(
			SOURCE,
			TRIGGER_NAME,
			htmlMessage,
			markdownMessage,
			textMessage,
			subject
		);
		await notificationServiceInstance.notifyAllChannels(userAddressDoc.notification_preferences);

		// 5. update last notified time
		firestore_db.collection('addresses').doc(userAddressDoc.address).set({
			notification_preferences: {
				...userAddressDoc.notification_preferences,
				triggerPreferences: {
					...(userAddressDoc.notification_preferences?.triggerPreferences || {}),
					[TRIGGER_NAME]: {
						...(userAddressDoc.notification_preferences.triggerPreferences[TRIGGER_NAME] || {}),
						lastNotified: new Date()
					}
				}
			}
		}, { merge: true });
	}
}
