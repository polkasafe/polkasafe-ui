// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { useContext, useEffect, useState } from 'react';
import { ApiContext, useGlobalApiContext } from 'src/context/ApiContext';
import { APP_NAME } from 'src/global/appName';
import { Wallet } from 'src/types';
import getEncodedAddress from 'src/utils/getEncodedAddress';

type Response = {
	noExtension: boolean;
	noAccounts: boolean;
	accounts: InjectedAccount[]
}

const initResponse: Response = {
	accounts: [],
	noAccounts: true,
	noExtension: true
};

const useGetWalletAccounts = () => {
	const { api, apiReady } = useContext(ApiContext);
	const { network } = useGlobalApiContext();

	const [response, setResponse] = useState<Response>(initResponse);

	const getWalletAccounts = async (chosenWallet: Wallet): Promise<InjectedAccount[] | undefined> => {
		const injectedWindow = window as Window & InjectedWindow;
		const responseLocal: Response = Object.assign({}, initResponse);

		const wallet = injectedWindow.injectedWeb3[chosenWallet];

		if (!wallet) {
			responseLocal.noExtension = true;
			setResponse(responseLocal);
			return;
		} else {
			responseLocal.noExtension = false;
		}

		let injected: Injected | undefined;

		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec
				if (!wallet || !wallet.enable) return;
				wallet.enable(APP_NAME).then(value => {
					clearTimeout(timeoutId);
					resolve(value);
				}).catch(error => {
					reject(error);
				});
			});
		} catch (err) {
			console.log('Error fetching wallet accounts : ', err);
		}

		if(!injected) {
			return;
		}

		const accounts = await injected.accounts.get();

		if (accounts.length === 0) {
			responseLocal.noAccounts = true;
			setResponse(responseLocal);
			return;
		} else {
			responseLocal.noAccounts = false;
		}

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		responseLocal.accounts = accounts;

		setResponse(responseLocal);

		return;
	};

	useEffect(() => {
		getWalletAccounts(Wallet.POLKADOT);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	return response;
};

export default useGetWalletAccounts;