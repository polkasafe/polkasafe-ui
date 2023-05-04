import { KeypairType } from '@polkadot/util-crypto/types';

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
		ss58Format: number;
		tokenDecimals: number;
		tokenSymbol: string;
		blockTime: number;
		keyringType?: KeypairType;
		rpcEndpoint: string;
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
	verfied: boolean;
}

export interface ITriggerPreferences{
	newTransaction: boolean;
	transactionExecuted: boolean;
	pendingTransaction: number;
}

export interface IUserNotificationPreferences {
	channelPreferences: {[index: string]: IUserNotificationChannelPreferences}
	triggerPreferences: ITriggerPreferences;
}
