import { NOTIFICATION_SOURCE } from '../notification_engine_constants';
import { htmlTemplateContainer } from './html-template-container';

export interface ITriggerTemplate {
	subject: string;
	template: string;
	args: string[];
}

export default async function getTriggerTemplate(
	firestore_db: FirebaseFirestore.Firestore,
	source: NOTIFICATION_SOURCE,
	trigger: string
): Promise<ITriggerTemplate | null> {
	const triggerDoc = await firestore_db.collection('notification_triggers').doc(trigger).get();
	const triggerData = triggerDoc?.data();
	if (!triggerData || !triggerData?.template) return null;

	return {
		subject: triggerData.subject || `${source.charAt(0).toUpperCase()}${source.slice(1)} notification`,
		template: htmlTemplateContainer(source, String(triggerData.template)),
		args: triggerData.args || []
	};
}
