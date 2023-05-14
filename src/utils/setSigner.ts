// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';
import { APP_NAME } from 'src/global/appName';
import { Wallet } from 'src/types';

export const setSigner = async (api: ApiPromise, chosenWallet: Wallet) => {
	const injectedWindow = window as Window & InjectedWindow;

	const wallet = injectedWindow.injectedWeb3[chosenWallet];

	if (!wallet) {
		return;
	}

	let injected: Injected | undefined;
	try {
		injected = await new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Wallet Timeout'));
			}, 60000); // wait 60 sec

			if(wallet && wallet.enable) {
				wallet.enable(APP_NAME)
					.then((value) => { clearTimeout(timeoutId); resolve(value); })
					.catch((error) => { reject(error); });
			}
		});
	} catch (err) {
		console.log(err?.message);
	}
	if (!injected) {
		return;
	}
	api.setSigner(injected.signer);
	return injected;
};