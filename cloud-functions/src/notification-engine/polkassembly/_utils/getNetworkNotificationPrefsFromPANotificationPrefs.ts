import { IUserNotificationPreferences } from '../../notification_engine_constants';
import { IPAUserNotificationPreferences } from './types';

export default function getNetworkNotificationPrefsFromPANotificationPrefs(
	pa_notification_prefs: IPAUserNotificationPreferences,
	network: string
): IUserNotificationPreferences {
	return {
		channelPreferences: pa_notification_prefs.channelPreferences || {},
		triggerPreferences: pa_notification_prefs.triggerPreferences?.[network] || {}
	};
}
