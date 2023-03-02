import { KeypairType } from '@polkadot/util-crypto/types';

export interface IAddressBookEntry {
	name: string;
	address: string;
}

export interface IUser {
	address: string;
	email: string | null;
	addressBook?: IAddressBookEntry[];
	created_at: Date;
}

export interface IMultisigAddress {
	address: string;
	name: string;
	signatories: string[];
	network: string;
	created_at: Date;
	threshold: number;
}

export interface IUserResponse extends IUser {
	multisigAddresses: IMultisigAddress[];
}

export interface ChainProperties {
	[network: string]: {
		ss58Format: number;
		tokenDecimals: number;
		tokenSymbol: string;
		blockTime: number;
		keyringType: KeypairType;
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
	callHash: string;
	network: string;
	status: 'Approval' | 'Cancelled' | 'Executed';
	created_at: Date;
	approvals: string[];
	threshold: number;
}
