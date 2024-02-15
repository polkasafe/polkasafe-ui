import { IUserNotificationPreferences } from '../../notification_engine_constants';
import { ITHUserNotificationPreferences } from './types';

export default function getHouseNotificationPrefsFromTHNotificationPrefs(
	th_notification_prefs: ITHUserNotificationPreferences,
	house_id: string
): IUserNotificationPreferences {
	return {
		channelPreferences: th_notification_prefs.channelPreferences || {},
		triggerPreferences: th_notification_prefs.triggerPreferences?.[house_id] || {}
	};
}
