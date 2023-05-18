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
	SLACK = 'slack',
	IN_APP = 'in_app'
}

export interface IUserNotificationChannelPreferences {
	name: CHANNEL;
	enabled: boolean;
	handle: string;
	verified: boolean;
	verification_token?: string;
}

export interface IUserNotificationTriggerPreferences {
	name: string;
	enabled: boolean;
}

export interface IUserNotificationPreferences {
	channelPreferences: {[index:string]: IUserNotificationChannelPreferences}
	triggerPreferences: {[index:string] : IUserNotificationTriggerPreferences}
}

export const NOTIFICATION_SOURCE_FIREBASE_ADMIN_CONFIG: {[index in NOTIFICATION_SOURCE] : string} = {
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: process.env.POLKASSEMBLY_FIREBASE_CONFIG || '',
	[NOTIFICATION_SOURCE.POLKASAFE]: process.env.POLKASAFE_FIREBASE_CONFIG || '',
	[NOTIFICATION_SOURCE.TOWNHALL]: process.env.TOWNHALL_FIREBASE_CONFIG || ''
};

// TODO: check TOWNHALL email
export const NOTIFICATION_SOURCE_EMAIL: {[index in NOTIFICATION_SOURCE] : string} = {
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: 'noreply@polkassembly.io',
	[NOTIFICATION_SOURCE.POLKASAFE]: 'noreply@polkasafe.xyz',
	[NOTIFICATION_SOURCE.TOWNHALL]: 'noreply@townhall.io'
};

export const NOTIFICATION_ENGINE_API_KEY = process.env.NOTIFICATION_ENGINE_API_KEY;
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
export const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
export const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
export const ELEMENT_API_KEY = process.env.ELEMENT_API_KEY;
