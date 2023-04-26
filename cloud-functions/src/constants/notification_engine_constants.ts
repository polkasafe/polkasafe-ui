export enum NOTIFICATION_SOURCE {
	POLKASSEMBLY= 'polkassembly',
	POLKASAFE= 'polkasafe',
	TOWNHALL= 'townhall'
}

export enum CHANNEL {
	EMAIL = 'email',
	TELEGRAM = 'telegram',
	DISCORD = 'discord',
	ELEMENT = 'element',
	SMS = 'sms',
	SLACK = 'slack'
}

export interface IUserNotificationChannelPreferences {
	name: CHANNEL;
	enabled: boolean;
	handle: string;
}

export interface IUserNotificationPreferences {
	[index: string]: IUserNotificationChannelPreferences
}

export const NOTIFICATION_ENGINE_API_KEY = process.env.NOTIFICATION_ENGINE_API_KEY || '';

export const NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG: {[index in NOTIFICATION_SOURCE] : string} = {
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: process.env.POLKASSEMBLY_FIREBASE_CONFIG || '',
	[NOTIFICATION_SOURCE.POLKASAFE]: process.env.POLKASAFE_FIREBASE_CONFIG || '',
	[NOTIFICATION_SOURCE.TOWNHALL]: process.env.TOWNHALL_FIREBASE_CONFIG || ''
};
