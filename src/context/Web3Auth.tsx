// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { SafeEventEmitterProvider } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { getWalletConnectV2Settings,WalletConnectV2Adapter } from '@web3auth/wallet-connect-v2-adapter';
import React, { useContext, useEffect, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import getNetwork from 'src/utils/getNetwork';

import { metamaskAdapter, openloginAdapter, torusPlugin, torusWalletAdapter, webAuth } from '../global';

// export interface ApiContextType {
// 	api: ApiPromise | undefined;
// 	apiReady: boolean;
// 	network: string;
// 	setNetwork: React.Dispatch<React.SetStateAction<string>>
// }

export const Web3AuthContext: React.Context<any> = React.createContext(
	{} as any
);

// export interface ApiContextProviderProps {
// 	children?: React.ReactElement;
// }

export function Web3AuthProvider({ children }: React.PropsWithChildren<{}>): React.ReactElement {
	const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
	const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);

	useEffect(() => {
		const init = async () => {
			try {
				webAuth.configureAdapter(openloginAdapter);
				await webAuth.addPlugin(torusPlugin);

				const defaultWcSettings = await getWalletConnectV2Settings('eip155', [1, 137, 5], '04309ed1007e77d1f119b85205bb779d');
				const walletConnectV2Adapter = new WalletConnectV2Adapter({
				  adapterSettings: { ...defaultWcSettings.adapterSettings },
				  loginSettings: { ...defaultWcSettings.loginSettings }
				});

				webAuth.configureAdapter(metamaskAdapter);
				webAuth.configureAdapter(torusWalletAdapter);
				webAuth.configureAdapter(walletConnectV2Adapter);

				if(webAuth.provider) {
					setProvider(webAuth.provider);
				}

				setWeb3Auth(webAuth);

				await webAuth.initModal();
			} catch (err) {
				console.log(`Error from web3Auth init func - ${err}`);
			}
		};

		init();
	},[]);

	return (
		<Web3AuthContext.Provider value={{ web3Auth }}>
			{children}
		</Web3AuthContext.Provider>
	);
}

export function useGlobalWeb3Context() {
	return useContext(Web3AuthContext);
}