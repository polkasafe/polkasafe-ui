import { NOTIFICATION_SOURCE } from '../../constants/notification_engine_constants';

export default async function callNotificationTrigger(source: NOTIFICATION_SOURCE, trigger: string, args?: any) {
	const triggerModulePath = `../${source}/${trigger}`;
	try {
		const { default: defaultExport } = await import(triggerModulePath);
		if (typeof defaultExport === 'function') {
			defaultExport(args);
		} else {
			throw new Error(`${trigger} is not a trigger module function`);
		}
	} catch (e: any) {
		throw new Error(`Failed to import notification trigger module ${triggerModulePath}: ${e.message}`);
	}
}
