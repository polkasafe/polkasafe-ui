import { KeypairType } from '@polkadot/util-crypto/types';

export interface IAddressBookItem {
	name: string;
	address: string;
	email?: string,
	roles?: string[],
	discord?: string,
	telegram?: string,
	nickName?: string
}

export interface IMultisigSettings {
	name: string;
	deleted: boolean;
}

export interface I2FASettings {
	base32_secret: string,
	enabled: boolean,
	url: string,
	verified: boolean
}

export interface IGenerate2FAResponse {
	base32_secret: string,
	url: string
}

export interface IUser {
	address: string;
	email: string | null;
	addressBook?: IAddressBookItem[];
	created_at: Date;
	multisigSettings: { [multisigAddress: string]: IMultisigSettings};
	notification_preferences?: IUserNotificationPreferences;
	transactionFields?: ITransactionFields
	two_factor_auth?: I2FASettings
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
	to: string | string[];
	token: string;
	amount_usd: string;
	amount_token: string;
	network: string;
	note?: string;
	transactionFields?: {category: string, subfields: {[subfield: string]: { name: string, value: string }}}
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
	totalAmount?: string
	transactionFields?: {category: string, subfields: {[subfield: string]: { name: string, value: string }}}
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

export interface IDropdownOptions{
	optionName: string,
	archieved?: boolean
}

export enum EFieldType{
	ATTACHMENT = 'Attachment',
	SINGLE_SELECT = 'Single-select',
	// MULTI_SELECT = 'Multi-select',
	TEXT = 'Text'
	// NUMBER = 'Number',
	// DATE = 'Date/Date-range',
	// LINK = 'link',
}

export interface ITransactionCategorySubfields{
	[subfield: string]: {
		subfieldName: string;
		subfieldType: EFieldType;
		required: boolean;
		dropdownOptions?: IDropdownOptions[]
	}
}

export interface ITransactionFields{
	[field: string]: {
		fieldName: string,
		fieldDesc: string,
		subfields: ITransactionCategorySubfields
	}
}

export interface ISharedAddressBookRecord {
	name: string,
	address: string,
	created_at?: Date,
	email?: string,
	discord?: string,
	telegram?: string,
	roles?: string[],
	updated_at?: Date,
	updatedBy?: string
}

export interface ISharedAddressBooks {
	records: {
		[address: string]: ISharedAddressBookRecord
	},
	multisig: string
}
