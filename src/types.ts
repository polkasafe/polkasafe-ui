// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Dispatch, SetStateAction } from 'react';

import { network, tokenSymbol } from './global/networkConstants';

export interface UserDetailsContextType {
    addresses?: string[] | null;
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

export type Network = typeof network[keyof typeof network];
export type TokenSymbol = typeof tokenSymbol[keyof typeof tokenSymbol];

export interface ChainProps {
    'blockTime': number;
    'logo'?: any;
    'ss58Format': number;
    'tokenDecimals': number;
    'tokenSymbol': TokenSymbol;
    'chainId': number;
    'rpcEndpoint': string;
    'category': string;
}

export type ChainPropType = {
    [index: string]: ChainProps;
};

interface IAddressBookEntry {
	name: string;
	address: string;
}

export interface IUser {
	address: string;
	email: string | null;
	multisigAddresses: string[];
	addressBook?: IAddressBookEntry[];
}

export interface IMultisigAddress {
	address: string;
	name: string;
	signatories: string[];
}

export interface IUserResponse extends Omit<IUser, 'multisigAddresses'> {
	multisigAddresses: IMultisigAddress[];
}
