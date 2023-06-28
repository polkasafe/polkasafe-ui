// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CHAIN_NAMESPACES } from '@web3auth/base';
import ethereumLogo from 'src/assets/eth.png';
import { ChainPropType } from 'src/types';

export enum NETWORK {
	GOERLI = 'goerli'
}
export const tokenSymbol = {
	GOERLI: 'GOER'
};

export const chainProperties: ChainPropType = {
	[NETWORK.GOERLI]: {
		blockExplorer: 'https://goerli.etherscan.io',
		chainId: '0x5',
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Goerli',
		logo: ethereumLogo,
		rpcTarget: 'https://goerli.blockpi.network/v1/rpc/public',
		ticker: 'ETH',
		tickerName: 'GoerliETH'
	}
};