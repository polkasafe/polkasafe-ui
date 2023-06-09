// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { getWalletConnectV2Settings, WalletConnectV2Adapter } from '@web3auth/wallet-connect-v2-adapter';
import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';

import { metamaskAdapter, openloginAdapter, torusPlugin, torusWalletAdapter, webAuth } from '../global';

export interface ApiContextType {
	web3Auth: Web3Auth | null,
	login: any,
	logout: any,
	authenticateUser: any,
	getChainId: any,
	getUserInfo: any,
	web3AuthUser: Web3AuthUser | null,
	signMessage: any,
	switchChain: any,
	ethProvider: any,
	provider: any
}

export interface Web3AuthUser {
	name?: string,
	email?: string,
	accounts: [string]
}

export const Web3AuthContext: React.Context<ApiContextType> = React.createContext(
	{} as any
);

export function Web3AuthProvider({ children }: React.PropsWithChildren<{}>): React.ReactElement {
	const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
	const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
	const [web3AuthUser, setWeb3AuthUser] = useState<Web3AuthUser | null>(null);
	const [ethProvider, setEthProvider] = useState<any | null>(null);

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

				if (webAuth.provider) {
					setProvider(webAuth.provider);
				}

				setWeb3Auth(webAuth);

				await webAuth.initModal();
			} catch (err) {
				console.log(`Error from web3Auth init func - ${err}`);
			}
		};

		init();
	}, []);


	const login = async () => {
		if (!web3Auth) {
			console.log('Web3 Auth not installed');
			return;
		}

		const web3authProvider = await web3Auth.connect();
		setProvider(web3authProvider);
		await getUserInfo(web3authProvider!);
	};

	const logout = async (): Promise<any | null> => {
		if (!web3Auth) {
			console.log('Web3 Auth not installed');
			return;
		}
		await web3Auth.logout();
		setProvider(null);
	};

	const authenticateUser = async (): Promise<any | undefined> => { //@TODO
		if (!web3Auth) {
			console.log('Web3 Auth not installed');
			return;
		}
		const idToken = await web3Auth.authenticateUser();
		return idToken;
	};

	const getUserInfo = async (givenProvider?: SafeEventEmitterProvider): Promise<any | null> => {
		if (!web3Auth) {
			console.log('Web3 Auth not installed');
			return;
		}
		const user = await web3Auth.getUserInfo();

		try {
			const ethersProvider = new ethers.providers.Web3Provider(givenProvider!);
			setEthProvider(ethersProvider);

			const signer = ethersProvider.getSigner();
			const address = await signer.getAddress();

			setWeb3AuthUser({
				accounts: [address],
				email: user.email || '',
				name: user.name || ''
			});
			return user;
		} catch (err) {
			console.log(err, 'err from getUserInfo');
		}
	};

	const signMessage = async (message: string): Promise<string> => {
		try {
			const signer = ethProvider.getSigner();

			return await signer.signMessage(message);
		} catch (error) {
			return error as string;
		}
	};

	const getChainId = async (): Promise<number> => {
		const { chainId } = await (ethProvider.getNetwork());
		console.log('yash chainId', chainId);
		return chainId;
	};

	const switchChain = async (chainId?: number) => {
		try {
			if (!provider || !web3Auth) {
				console.log('provider not initialized yet');
				return;
			}
			await web3Auth.switchChain({ chainId: '0x5' });
		} catch (err) {
			console.log('error from switchChain', err);
		}
	};

	const addChain = async () => {
		if (!provider || !web3Auth) {
			console.log('provider not initialized yet');
			return;
		}
		const newChain = {
			chainId: '0x5',
			displayName: 'Goerli',
			chainNamespace: CHAIN_NAMESPACES.EIP155,
			tickerName: 'Goerli',
			ticker: 'ETH',
			decimals: 18,
			rpcTarget: 'https://goerli.blockpi.network/v1/rpc/public',
			blockExplorer: 'https://goerli.etherscan.io'
		};
		await web3Auth.addChain(newChain);
	};

	return (
		<Web3AuthContext.Provider value={{ authenticateUser, ethProvider, getChainId, getUserInfo, login, logout, provider, signMessage, switchChain, web3Auth, web3AuthUser }}>
			{children}
		</Web3AuthContext.Provider>
	);
}

export function useGlobalWeb3Context() {
	return useContext(Web3AuthContext);
}