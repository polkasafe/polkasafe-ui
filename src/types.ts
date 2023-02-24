// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dispatch, SetStateAction } from 'react';

import { networks, tokenSymbol } from './global/networkConstants';

export interface UserDetailsContextType {
    activeMultisig: string;
    address: string;
    multisigAddresses: IMultisigAddress[];
    addressBook: IAddressBookEntry[];
    setUserDetailsContextState: Dispatch<SetStateAction<UserDetailsContextType>>;
}

export enum Wallet {
    POLKADOT = 'polkadot-js'
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
    'existentialDeposit': number;
}

export type ChainPropType = {
    [index: string]: ChainProps;
};

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