import { ChainProperties } from '../types';
import { CHAIN_NAMESPACES } from '@web3auth/base';

export enum NETWORK {
	GOERLI = 'goerli'
}

export const chainProperties: ChainProperties = {
	[NETWORK.GOERLI]: {
		blockExplorer: 'https://goerli.etherscan.io',
		chainId: '0x5',
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Goerli',
		rpcTarget: 'https://goerli.blockpi.network/v1/rpc/public',
		ticker: 'ETH',
		tickerName: 'GoerliETH'
	}
};
