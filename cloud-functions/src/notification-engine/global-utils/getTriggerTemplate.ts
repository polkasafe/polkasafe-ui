import { NOTIFICATION_SOURCE } from '../notification_engine_constants';
import { emailTemplateContainer } from './email-template-container';

export default async function getTriggerTemplate(
	firestore_db: FirebaseFirestore.Firestore,
	source: NOTIFICATION_SOURCE,
	trigger: string
): Promise<string | null> {
	const triggerDoc = await firestore_db.collection('triggers').doc(trigger).get();
	const triggerData = triggerDoc?.data();
	if (triggerData && triggerData?.template) return emailTemplateContainer(source, String(triggerData.template));
	return null;
}
