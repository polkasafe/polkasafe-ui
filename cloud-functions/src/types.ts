import { KeypairType } from '@polkadot/util-crypto/types';

interface IAddressBookEntry {
	name: string;
	address: string;
}

export interface IUser {
	address: string;
	email: string | null;
	addressBook?: IAddressBookEntry[];
}

export interface IMultisigAddress {
	address: string;
	name: string;
	signatories: string[];
	network: string;
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
