// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CHAIN_NAMESPACES } from '@web3auth/base';
import { MetamaskAdapter } from '@web3auth/metamask-adapter';
import { Web3Auth } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { TorusWalletAdapter } from '@web3auth/torus-evm-adapter';
import { TorusWalletConnectorPlugin } from '@web3auth/torus-wallet-connector-plugin';

// of the Apache-2.0 license. See the LICENSE file for details.
export const WEB3AUTH_CLIENT_ID = process.env.REACT_APP_WEB3_AUTH_CLIENT_ID;
export const WEB3AUTH_SECRET = process.env.REACT_APP_WEB3_AUTH_CLIENT_SECRET;

export const webAuth = new Web3Auth({
	chainConfig: {
		chainId: '0x1',
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		rpcTarget: 'https://rpc.ankr.com/eth' // @TODO change this to infura node
	},
	clientId: WEB3AUTH_CLIENT_ID!,
	uiConfig: {
		appLogo: 'https://web3auth.io/images/w3a-L-Favicon-1.svg', // @TODO Customise this to our logo
		defaultLanguage: 'en',

		loginMethodsOrder: ['google'],
		theme: 'dark'
	},
	web3AuthNetwork: 'cyan'
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
			theme: {  colors: { primary: '#00a8ff' }, isDark: true }
		}
	}
});

export const metamaskAdapter = new MetamaskAdapter({
	chainConfig: {
		chainId: '0x5',
		displayName: 'Goerli',
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		tickerName: 'Goerli',
		ticker: 'ETH',
		decimals: 18,
		rpcTarget: 'https://eth-goerli.public.blastapi.io',
		blockExplorer: 'https://goerli.etherscan.io' // This is the public RPC we have added, please pass on your own endpoint while creating an app
	},
	clientId: WEB3AUTH_CLIENT_ID,
	sessionTime: 3600, // 1 hour in seconds
	web3AuthNetwork: 'cyan'
});

export const torusWalletAdapter = new TorusWalletAdapter({
	clientId: WEB3AUTH_CLIENT_ID
});
