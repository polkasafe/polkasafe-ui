// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import alephzeroLogo from 'src/assets/parachains-logos/aleph-zero-logo.jpeg';
import assethubLogo from 'src/assets/parachains-logos/assethub-logo.png';
import astarLogo from 'src/assets/parachains-logos/astar-logo.png';
import kusamaLogo from 'src/assets/parachains-logos/kusama-logo.gif';
import polkadotLogo from 'src/assets/parachains-logos/polkadot-logo.jpg';
import rococoLogo from 'src/assets/parachains-logos/rococo-logo.svg';
import westendLogo from 'src/assets/parachains-logos/westend-logo.png';
import { ChainPropType } from 'src/types';

export const networks = {
	ALEPHZERO: 'alephzero',
	ASTAR: 'astar',
	KUSAMA: 'kusama',
	POLKADOT: 'polkadot',
	ROCOCO: 'rococo',
	STATEMINE: 'assethub-kusama',
	STATEMINT: 'assethub-polkadot',
	WESTEND: 'westend'
};

export const tokenSymbol = {
	ASTR: 'ASTR',
	AZERO: 'AZERO',
	DOT: 'DOT',
	KSM: 'KSM',
	ROC: 'ROC',
	WND: 'WND'
};

export const chainProperties: ChainPropType = {
	[networks.POLKADOT]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: '1.00',
		logo: polkadotLogo,
		rpcEndpoint: 'wss://rpc.polkadot.io',
		ss58Format: 0,
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT
	},
	[networks.KUSAMA]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: '0.000333333333',
		logo: kusamaLogo,
		rpcEndpoint: 'wss://kusama-rpc.polkadot.io',
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.KSM
	},
	[networks.WESTEND]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: '0.0100',
		logo: westendLogo,
		rpcEndpoint: 'wss://westend-rpc.dwellir.com',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.WND
	},
	[networks.ROCOCO]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: '0.000033333333',
		logo: rococoLogo,
		rpcEndpoint: 'wss://rococo-rpc.polkadot.io',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.ROC
	},
	[networks.ASTAR]: {
		blockTime: 12000,
		chainId: 0,
		existentialDeposit: '0.000000000001',
		logo: astarLogo,
		rpcEndpoint: 'wss://astar.api.onfinality.io/public-ws',
		ss58Format: 5,
		tokenDecimals: 18,
		tokenSymbol: tokenSymbol.ASTR
	},
	[networks.STATEMINT]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: '0.1000',
		logo: assethubLogo,
		rpcEndpoint: 'wss://statemint.api.onfinality.io/public-ws',
		ss58Format: 0,
		tokenDecimals: 10,
		tokenSymbol: tokenSymbol.DOT
	},
	[networks.STATEMINE]: {
		blockTime: 6000,
		chainId: 0,
		existentialDeposit: '0.000033333333',
		logo: assethubLogo,
		rpcEndpoint: 'wss://statemine.api.onfinality.io/public-ws',
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.KSM
	},
	[networks.ALEPHZERO]: {
		blockTime: 1000,
		chainId: 0,
		existentialDeposit: '0.0000000005',
		logo: alephzeroLogo,
		rpcEndpoint: 'wss://ws.azero.dev/',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: tokenSymbol.AZERO
	}

};