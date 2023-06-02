// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CHAIN_NAMESPACES } from '@web3auth/base';
import { MetamaskAdapter } from '@web3auth/metamask-adapter';
import { Web3Auth } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { TorusWalletAdapter } from '@web3auth/torus-evm-adapter';
import { TorusWalletConnectorPlugin } from '@web3auth/torus-wallet-connector-plugin';
import { getWalletConnectV2Settings,WalletConnectV2Adapter } from '@web3auth/wallet-connect-v2-adapter';

// of the Apache-2.0 license. See the LICENSE file for details.
export const WEB3AUTH_CLIENT_ID = process.env.REACT_APP_WEB3_AUTH_CLIENT_ID;
export const WEB3AUTH_SECRET = process.env.REACT_APP_WEB3_AUTH_CLIENT_SECRET;

export const webAuth = new Web3Auth({
	clientId: WEB3AUTH_CLIENT_ID!,
	chainConfig: {
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		chainId: '0x1',
		rpcTarget: 'https://rpc.ankr.com/eth' // @TODO change this to infura node
	},
	uiConfig: {
		theme: 'dark',
		loginMethodsOrder: ['google'],
		defaultLanguage: 'en',
		appLogo: 'https://web3auth.io/images/w3a-L-Favicon-1.svg' // @TODO Customise this to our logo
	},
	web3AuthNetwork: 'cyan'
});

export const openloginAdapter = new OpenloginAdapter({
	loginSettings: {
	  mfaLevel: 'default'
	},
	adapterSettings: {
	  whiteLabel: {
			name: 'Polkasafe',
			logoLight: 'https://web3auth.io/images/w3a-L-Favicon-1.svg', // @TODO add logo
			logoDark: 'https://web3auth.io/images/w3a-D-Favicon-1.svg',
			defaultLanguage: 'en',
			dark: true
	  }
	}
});

export const torusPlugin = new TorusWalletConnectorPlugin({
	torusWalletOpts: {},
	walletInitOptions: {
	  whiteLabel: {
			theme: { isDark: true, colors: { primary: '#00a8ff' } },
			logoDark: 'https://web3auth.io/images/w3a-L-Favicon-1.svg', //@TODO
			logoLight: 'https://web3auth.io/images/w3a-D-Favicon-1.svg'
	  },
	  useWalletConnect: true,
	  enableLogging: true
	}
});

export  const metamaskAdapter = new MetamaskAdapter({
	clientId: WEB3AUTH_CLIENT_ID,
	sessionTime: 3600, // 1 hour in seconds
	web3AuthNetwork: 'cyan',
	chainConfig: {
	  chainNamespace: CHAIN_NAMESPACES.EIP155,
	  chainId: '0x1',
	  rpcTarget: 'https://rpc.ankr.com/eth' // This is the public RPC we have added, please pass on your own endpoint while creating an app
	}
});

export  const torusWalletAdapter = new TorusWalletAdapter({
	clientId: WEB3AUTH_CLIENT_ID
});
