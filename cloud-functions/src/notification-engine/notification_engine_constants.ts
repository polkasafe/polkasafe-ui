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

export const TELEGRAM_BOT_TOKEN: {[index in NOTIFICATION_SOURCE] : string | undefined} = {
	[NOTIFICATION_SOURCE.POLKASAFE]: process.env.POLKASAFE_TELEGRAM_BOT_TOKEN,
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: process.env.POLKASSEMBLY_TELEGRAM_BOT_TOKEN,
	[NOTIFICATION_SOURCE.TOWNHALL]: process.env.TOWNHALL_TELEGRAM_BOT_TOKEN
};

interface IDiscordBotSecrets {
	token: string | undefined;
	publicKey: string | undefined;
	clientId: string | undefined;
}

export const DISCORD_BOT_SECRETS: {[index in NOTIFICATION_SOURCE]: IDiscordBotSecrets} = {
	[NOTIFICATION_SOURCE.POLKASAFE]: {
		token: process.env.POLKASAFE_DISCORD_BOT_TOKEN,
		publicKey: process.env.POLKASAFE_DISCORD_PUBLIC_KEY,
		clientId: process.env.POLKASAFE_DISCORD_CLIENT_ID
	},
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: {
		token: process.env.POLKASSEMBLY_DISCORD_BOT_TOKEN,
		publicKey: process.env.POLKASSEMBLY_DISCORD_PUBLIC_KEY,
		clientId: process.env.POLKASSEMBLY_DISCORD_CLIENT_ID
	},
	[NOTIFICATION_SOURCE.TOWNHALL]: {
		token: process.env.TOWNHALL_DISCORD_BOT_TOKEN,
		publicKey: process.env.TOWNHALL_DISCORD_PUBLIC_KEY,
		clientId: process.env.TOWNHALL_DISCORD_CLIENT_ID
	}
};

export const SLACK_BOT_TOKEN: {[index in NOTIFICATION_SOURCE] : string | undefined} = {
	[NOTIFICATION_SOURCE.POLKASAFE]: process.env.POLKASAFE_SLACK_BOT_TOKEN,
	[NOTIFICATION_SOURCE.POLKASSEMBLY]: process.env.POLKASSEMBLY_SLACK_BOT_TOKEN,
	[NOTIFICATION_SOURCE.TOWNHALL]: process.env.TOWNHALL_SLACK_BOT_TOKEN
};

export const NOTIFICATION_ENGINE_API_KEY = process.env.NOTIFICATION_ENGINE_API_KEY;
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const ELEMENT_API_KEY = process.env.ELEMENT_API_KEY;
