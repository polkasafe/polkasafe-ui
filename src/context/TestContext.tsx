// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { Polkasafe } from 'polkasafe';
import { createContext,FC, PropsWithChildren } from 'react';
import { APP_NAME } from 'src/global/appName';
import { Wallet } from 'src/types';
export const TestContext= createContext({});

export const TestContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const client = new Polkasafe();
	const address = localStorage.getItem('address');
	const network = localStorage.getItem('network');
	const signature = localStorage.getItem('signature');
	const selectedWallet = localStorage.getItem('logged_in_wallet');
	const injectedWindow = window as Window & InjectedWindow;
	if(address && network && signature && selectedWallet){
		const setClient = async () => {
			const wallet = injectedWindow.injectedWeb3[selectedWallet || Wallet.POLKADOT];

			if (!wallet) {
				return;
			}
			const injected = wallet && wallet.enable && await wallet.enable(APP_NAME);
			client.address = address;
			client.network = network;
			client.signature = signature;
			client.injector = injected;

		};
		setClient();
	}
	console.log('something');
	// eslint-disable-next-line react/react-in-jsx-scope
	return <TestContext.Provider value={{ client }}>
		{children}
	</TestContext.Provider>;
};