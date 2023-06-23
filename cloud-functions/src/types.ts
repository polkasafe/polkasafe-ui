export interface IAddressBookItem {
	name: string;
	address: string;
}

export interface IMultisigSettings {
	name: string;
	deleted: boolean;
}

export interface IUser {
	address: string;
	email: string | null;
	addressBook?: IAddressBookItem[];
	created_at: Date;
	multisigSettings: { [multisigAddress: string]: IMultisigSettings};
	notification_preferences?: IUserNotificationPreferences;
}

export interface IUserResponse extends IUser {
	multisigAddresses?: IMultisigAddress[];
}

export interface IMultisigAddress {
	address: string;
	name: string;
	signatories: string[];
	network: string;
	created_at: Date;
	updated_at?: Date;
	threshold: number;
	proxy?: string
	disabled?: boolean
}

export interface ChainProperties {
	[network: string]: {
		blockExplorer: string;
		chainId: string;
		chainNamespace: string;
		decimals: number;
		displayName: string;
		rpcTarget: string;
		ticker: string;
		tickerName: string
	};
}

export interface ITransaction {
	callData?: string;
	callHash: string;
	created_at: Date;
	block_number: number;
	from: string;
	to: string;
	token: string;
	amount_usd: string;
	amount_token: string;
	network: string;
	note?: string;
	notifications?: {
		[address: string]: {
			lastNotified: Date;
		}
	}
}

export interface IAsset {
	name: string;
	logoURI: string;
	symbol: string;
	balance_usd: string;
	balance_token: string;
}

export interface IFeedback {
	address: string;
	rating: number;
	review: string;
}

export interface IContactFormResponse {
	name: string;
	email: string;
	message: string;
}

export interface IQueueItem {
	callData: string;
	callHash: string;
	network: string;
	status: 'Approval' | 'Cancelled' | 'Executed';
	created_at: Date;
	approvals: string[];
	threshold: number;
	note?: string;
	notifications?: {
		[address: string]: {
			lastNotified: Date;
		}
	}
}

export interface INotification {
	id: string,
	addresses: string[],
	created_at: Date,
	message: string,
	link?: string,
	type: 'sent' | 'recieved' | 'cancelled' | 'info'
	network: string
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
	channelPreferences: {[index: string]: IUserNotificationChannelPreferences}
	triggerPreferences: {[index:string]: IUserNotificationTriggerPreferences}
}
