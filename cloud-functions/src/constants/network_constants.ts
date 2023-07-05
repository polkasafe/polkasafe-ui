import { ChainProperties } from '../types';

export const networks = {
	ASTAR: 'astar',
	ALEPHZERO: 'alephzero',
	POLKADOT: 'polkadot',
	KUSAMA: 'kusama',
	WESTEND: 'westend',
	ROCOCO: 'rococo',
	STATEMINT: 'assethub-polkadot',
	STATEMINE: 'assethub-kusama'
};

export const chainProperties: ChainProperties = {
	[networks.POLKADOT]: {
		blockTime: 6000,
		keyringType: 'sr25519',
		rpcEndpoint: 'wss://rpc.polkadot.io',
		ss58Format: 0,
		tokenDecimals: 10,
		tokenSymbol: 'DOT'
	},
	[networks.KUSAMA]: {
		blockTime: 6000,
		keyringType: 'ed25519',
		rpcEndpoint: 'wss://kusama-rpc.polkadot.io',
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: 'KSM'
	},
	[networks.WESTEND]: {
		blockTime: 6000,
		keyringType: 'sr25519',
		rpcEndpoint: 'wss://westend-rpc.dwellir.com',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: 'WND'
	},
	[networks.ROCOCO]: {
		blockTime: 6000,
		keyringType: 'sr25519',
		rpcEndpoint: 'wss://rococo-rpc.polkadot.io',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: 'ROC'
	},
	[networks.ASTAR]: {
		blockTime: 12000,
		rpcEndpoint: 'wss://astar-rpc.dwellir.com',
		ss58Format: 5,
		tokenDecimals: 18,
		tokenSymbol: 'ASTR'
	},
	[networks.STATEMINT]: {
		blockTime: 6000,
		rpcEndpoint: 'wss://statemint.api.onfinality.io/public-ws',
		ss58Format: 0,
		tokenDecimals: 10,
		tokenSymbol: 'DOT'
	},
	[networks.STATEMINE]: {
		blockTime: 6000,
		rpcEndpoint: 'wss://statemine.api.onfinality.io/public-ws',
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: 'KSM'
	},
	[networks.ALEPHZERO]: {
		blockTime: 1000,
		rpcEndpoint: 'wss://ws.azero.dev/',
		ss58Format: 42,
		tokenDecimals: 12,
		tokenSymbol: 'AZERO'
	}
};
