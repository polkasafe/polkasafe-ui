// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import kusamaLogo from 'src/assets/parachains-logos/kusama-logo.gif';
import polkadotLogo from 'src/assets/parachains-logos/polkadot-logo.jpg';
import { ChainPropType } from 'src/types';

export const network = {
	KUSAMA: 'kusama',
	POLKADOT: 'polkadot'
};

export const tokenSymbol = {
	DOT: 'DOT',
	KSM: 'KSM'
};

export const chainProperties: ChainPropType = {
	[network.POLKADOT]: {
		blockTime: 6000,
		category: 'polkadot',
		chainId: 0,
		logo: polkadotLogo,
		rpcEndpoint: 'wss://rpc.polkadot.io',
		ss58Format: 0,
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT
	},
	[network.KUSAMA]: {
		blockTime: 6000,
		category: 'kusama',
		chainId: 0,
		logo: kusamaLogo,
		rpcEndpoint: 'wss://kusama-rpc.polkadot.io',
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.KSM
	}
};