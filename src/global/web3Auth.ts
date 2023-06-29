// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CHAIN_NAMESPACES } from '@web3auth/base';
import { MetamaskAdapter } from '@web3auth/metamask-adapter';
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { TorusWalletAdapter } from '@web3auth/torus-evm-adapter';
import { TorusWalletConnectorPlugin } from '@web3auth/torus-wallet-connector-plugin';

import { chainProperties, NETWORK } from './networkConstants';

// of the Apache-2.0 license. See the LICENSE file for details.
export const WEB3AUTH_CLIENT_ID = 'BBfZ90Z0u4b_o6dDVe5S9KBOoV7SuYE6RqEf9YYQAv78d0zrcQXi6r0r8KofVUamwCDqzpi885y4MaS7jLzFVpc';
export const WEB3AUTH_SECRET = '720cee4d131652a8fef38f644d5905b259d5518ac0bd9d5da3ad72fd8847cf06';

export const webAuth = new Web3Auth({
	chainConfig: {
		blockExplorer: 'https://polygonscan.com/',
		chainId: '0x89',
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Polygon',
		rpcTarget: 'https://polygon-rpc.com/',
		ticker: 'MATIC',
		tickerName: 'Matic'
	},
	clientId: WEB3AUTH_CLIENT_ID!,
	uiConfig: {
		appLogo: 'https://web3auth.io/images/w3a-L-Favicon-1.svg', // @TODO Customise this to our logo
		defaultLanguage: 'en',

		loginMethodsOrder: ['google'],
		theme: 'dark'
	},
	web3AuthNetwork: 'mainnet'
});

export const openloginAdapter = new OpenloginAdapter({
	adapterSettings: {
		whiteLabel: {
			dark: true,
			defaultLanguage: 'en',
			logoDark: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
			logoLight: 'https://web3auth.io/images/w3a-L-Favicon-1.svg', // @TODO add logo
			name: 'Polkasafe'
		}
	},
	loginSettings: {
		mfaLevel: 'default'
	}

});

export const torusPlugin = new TorusWalletConnectorPlugin({
	torusWalletOpts: {},
	walletInitOptions: {
		enableLogging: true,
		useWalletConnect: true,
		whiteLabel: {
			logoDark: 'https://web3auth.io/images/w3a-L-Favicon-1.svg', //@TODO
			logoLight: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
			theme: { colors: { primary: '#00a8ff' }, isDark: true }
		}
	}
});

export const metamaskAdapter = new MetamaskAdapter({
	chainConfig: {
		blockExplorer: 'https://polygonscan.com/',
		chainId: '0x89',
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Polygon',
		rpcTarget: 'https://polygon-rpc.com/',
		ticker: 'MATIC',
		tickerName: 'Matic'
	},
	clientId: WEB3AUTH_CLIENT_ID,
	sessionTime: 3600, // 1 hour in seconds
	web3AuthNetwork: 'mainnet'
});

export const torusWalletAdapter = new TorusWalletAdapter({
	clientId: WEB3AUTH_CLIENT_ID
});

export const options: Web3AuthOptions = {
	chainConfig: {
		blockExplorer: 'https://polygonscan.com/',
		chainId: '0x89',
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Polygon',
		rpcTarget: 'https://polygon-rpc.com/',
		ticker: 'MATIC',
		tickerName: 'Matic'
	},
	clientId: WEB3AUTH_CLIENT_ID,
	uiConfig: {
		loginMethodsOrder: ['google', 'facebook'],
		theme: 'dark'

	},
	web3AuthNetwork: 'mainnet'
};

export const returnChainConfig = (network: NETWORK) => {
	if (network === NETWORK.GOERLI) {
		return chainProperties[NETWORK.GOERLI];
	} else if (network === NETWORK.POLYGON) {
		chainProperties[NETWORK.POLYGON];
	}
};
