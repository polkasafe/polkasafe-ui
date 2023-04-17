// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import kusamaLogo from 'src/assets/parachains-logos/kusama-logo.gif';
import polkadotLogo from 'src/assets/parachains-logos/polkadot-logo.jpg';
import westendLogo from 'src/assets/parachains-logos/westend-logo.png';
import { ChainPropType } from 'src/types';

export const networks = {
	KUSAMA: 'kusama',
	POLKADOT: 'polkadot',
	ROCOCO: 'rococo',
	WESTEND: 'westend'
};

export const tokenSymbol = {
	DOT: 'DOT',
	KSM: 'KSM',
	ROC: 'ROC',
	WND: 'WND'
};

export const chainProperties: ChainPropType = {
	[networks.POLKADOT]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: 1.00,
		logo: polkadotLogo,
		rpcEndpoint: 'wss://rpc.polkadot.io',
		ss58Format: 0,
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT
	},
	[networks.KUSAMA]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: 0.000333333333,
		logo: kusamaLogo,
		rpcEndpoint: 'wss://kusama-rpc.polkadot.io',
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.KSM
	},
	[networks.WESTEND]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: 0.0100,
		logo: westendLogo,
		rpcEndpoint: 'wss://westend-rpc.dwellir.com',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.WND
	},
	[networks.ROCOCO]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: 0.000033333333,
		logo: westendLogo,
		rpcEndpoint: 'wss://rococo-rpc.polkadot.io',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ROC
	}

};