// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SafeEventEmitterProvider } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import { getWalletConnectV2Settings, WalletConnectV2Adapter } from '@web3auth/wallet-connect-v2-adapter';
import { ethers } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties, NETWORK } from 'src/global/networkConstants';
import Web3 from 'web3';

import { metamaskAdapter, openloginAdapter, torusPlugin, torusWalletAdapter, webAuth } from '../global';

export interface Web3AuthContextType {
	web3Auth: Web3Auth | null,
	login: any,
	logout: any,
	authenticateUser: any,
	getChainId: any,
	getUserInfo: any,
	web3AuthUser: Web3AuthUser | null,
	signMessage: any,
	switchChain: any,
	ethProvider: any | null,
	provider: SafeEventEmitterProvider | null,
	addChain: any,
	sendNativeToken: any
	web3Provider: Web3 | null
	handleWeb3AuthConnection: any
	init: any
}

export interface Web3AuthUser {
	name?: string,
	email?: string,
	accounts: [string]
}

export const Web3AuthContext: React.Context<Web3AuthContextType> = React.createContext(
	{} as any
);

const DEFAULT_NETWORK = 'polygon';

export function Web3AuthProvider({ children }: React.PropsWithChildren<{}>): React.ReactElement {
	const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
	const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
	const [web3AuthUser, setWeb3AuthUser] = useState<Web3AuthUser | null>(null);
	const [ethProvider, setEthProvider] = useState<ethers.providers.Web3Provider | null>(null);
	const [web3Provider, setWeb3Provider] = useState<Web3 | null>(null);

	useEffect(() => {
		if (!web3Auth?.connectedAdapterName) init();
	}, [web3Auth?.connectedAdapterName]);

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

	useEffect(() => {
		if (web3Auth) {
			console.log('web3Auth running');
			login();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [web3Auth]);

	useEffect(() => {
		if (provider) getUserInfo(provider);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [provider]);

	useEffect(() => {
		const web3Providers = async () => {
			const web = new Web3(provider!);
			setWeb3Provider(web);

			const ethersProvider = new ethers.providers.Web3Provider(provider!);
			setEthProvider(ethersProvider);
		};
		if (provider) web3Providers();
	}, [provider]);

	const handleWeb3AuthConnection = async (ethProvider: any): Promise<any | null> => {
		const signer = ethProvider.getSigner();

		const tokenResponse = await fetch(`${FIREBASE_FUNCTIONS_URL}/getConnectAddressTokenEth`, {
			headers: firebaseFunctionsHeader(DEFAULT_NETWORK, await signer.getAddress()),
			method: 'POST'
		});

		const { data: token, error: tokenError } = await tokenResponse.json();

		if (!tokenError) {
			const signature = await signMessage(token, ethProvider);

			if (signature) {
				const { data } = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddressEth`, {
					headers: firebaseFunctionsHeader(DEFAULT_NETWORK, await signer.getAddress(), signature),
					method: 'POST'
				}).then(res => res.json());

				localStorage.setItem('address', await signer.getAddress());
				localStorage.setItem('signature', signature);
				return data;
			}
		}
	};

	const login = async (): Promise<string | null> => {
		if (!web3Auth) {
			console.log('Web3 Auth not installed');
			return null;
		}
		try {
			const web3authProvider = await web3Auth.connect();
			setProvider(web3authProvider);
			return await getUserInfo(web3authProvider!);
		} catch (err) {
			console.log(`Error from login: ${err}`);
			return null;
		}
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
			return null;
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

			return ethersProvider;
		} catch (err) {
			console.log(err, 'err from getUserInfo');
			return null;
		}
	};

	const signMessage = async (message: string, ethProvider: any): Promise<string | null> => {
		if (!ethProvider) {
			console.log('provider not initialized yet signMessage');
			return null;
		}

		try {
			const signer = ethProvider.getSigner();

			return await signer.signMessage(message);
		} catch (error) {
			return error as string;
		}
	};

	const getChainId = async (): Promise<number | null> => {
		if (!provider || !web3Auth || !ethProvider) {
			console.log('provider not initialized yet');
			return null;
		}
		const { chainId } = await (ethProvider.getNetwork());

		return chainId;
	};

	const switchChain = async (chainId?: string) => {
		try {
			if (!provider || !web3Auth) {
				console.log('provider not initialized yet');
				return;
			}
			await web3Auth.switchChain({ chainId: chainId || '0x5' });
		} catch (err) {
			console.log('error from switchChain', err);
		}
	};

	const addChain = async (newChain: NETWORK) => {
		if (!provider || !web3Auth) {
			console.log('provider not initialized yet');
			return;
		}
		await web3Auth.addChain(chainProperties[newChain]);
	};

	const sendNativeToken = async (destination: string, amount: ethers.BigNumber) => {
		if (!provider || !web3Auth || !ethProvider) {
			console.log('provider not initialized yet');
			return;
		}

		const signer = ethProvider.getSigner();

		const tx = await signer.sendTransaction({
			to: destination,
			value: amount.toString()
		});

		return await tx.wait();
	};

	return (
		<Web3AuthContext.Provider value={{ addChain, authenticateUser, ethProvider, getChainId, getUserInfo, handleWeb3AuthConnection, init, login, logout, provider, sendNativeToken, signMessage, switchChain, web3Auth, web3AuthUser, web3Provider }}>
			{children}
		</Web3AuthContext.Provider>
	);
}

export function useGlobalWeb3Context() {
	return useContext(Web3AuthContext);
}