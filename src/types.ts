// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dispatch, SetStateAction } from 'react';

import { networks, tokenSymbol } from './global/networkConstants';

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

export interface ITriggerPreferences{
	newTransaction: boolean;
	transactionExecuted: boolean;
	pendingTransaction: number;
}

export interface IUserNotificationPreferences {
	channelPreferences: {[index: string]: IUserNotificationChannelPreferences}
	triggerPreferences: ITriggerPreferences;
}

export interface UserDetailsContextType {
	loggedInWallet: Wallet;
    activeMultisig: string;
	isProxy: boolean;
    address: string;
	createdAt: Date;
    multisigAddresses: IMultisigAddress[];
	multisigSettings: { [multisigAddress: string]: IMultisigSettings};
	notificationPreferences: IUserNotificationPreferences;
    addressBook: IAddressBookItem[];
		notifiedTill: Date | null;
    setUserDetailsContextState: Dispatch<SetStateAction<UserDetailsContextType>>;
}

export enum Wallet {
    POLKADOT = 'polkadot-js',
	SUBWALLET = 'subwallet-js',
	TALISMAN = 'talisman',
}

export interface AccountMeta {
    genesisHash: string | undefined;
    name: string;
    source: string;
}

export interface Account {
    address: string;
    meta: AccountMeta;
}

export type Network = typeof networks[keyof typeof networks];
export type TokenSymbol = typeof tokenSymbol[keyof typeof tokenSymbol];

export interface ChainProps {
    'blockTime': number;
    'logo'?: any;
    'ss58Format': number;
    'tokenDecimals': number;
    'tokenSymbol': TokenSymbol;
    'chainId': number;
    'rpcEndpoint': string;
    'existentialDeposit': string;
}

export type ChainPropType = {
    [index: string]: ChainProps;
};

export interface IAddressBookItem {
	name: string;
	address: string;
}

interface IMultisigSettings {
	deleted: boolean;
	name: string;
}

export interface IUser {
	address: string;
	email: string | null;
	addressBook?: IAddressBookItem[];
	created_at: Date;
	multisigAddresses: IMultisigAddress[];
	multisigSettings: { [multisigAddress: string]: IMultisigSettings};
	notificationPreferences: IUserNotificationPreferences;
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

export interface IUserResponse extends IUser {
	multisigAddresses: IMultisigAddress[];
}

export interface IAsset {
	name: string;
	logoURI: string;
	symbol: string;
	balance_usd: string;
	balance_token: string;
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

export interface ITransaction {
	callData?: string;
	callHash: string;
	created_at: Date;
	block_number: number;
	from: string;
	to: string;
	id: string;
	token: string;
	amount_usd: number;
	amount_token: number;
	network: string;
	note?: string;
}

export interface INotification {
	id: string,
	addresses: string[],
	created_at: Date,
	message: string,
	link?: string,
	type: 'sent' | 'recieved' | 'cancelled' | 'info',
	network: string
}

export enum NotificationStatus {
	SUCCESS= 'success',
	ERROR = 'error',
	WARNING = 'warning',
	INFO = 'info'
  }