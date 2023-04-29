// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import React, { useEffect, useState } from 'react';
import PolkadotWalletIcon from 'src/assets/wallet/polkadotjs-icon.svg';
import SubWalletIcon from 'src/assets/wallet/subwallet-icon.svg';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { APP_NAME } from 'src/global/appName';
import { Wallet } from 'src/types';
import getEncodedAddress from 'src/utils/getEncodedAddress';

import WalletButton from './WalletButton';

interface IWalletButtons{
    setAccounts: React.Dispatch<React.SetStateAction<InjectedAccount[]>>
    setWallet?: React.Dispatch<React.SetStateAction<Wallet>>
	className?: string
	setNoExtenstion?: React.Dispatch<React.SetStateAction<boolean>>
	setNoAccounts?: React.Dispatch<React.SetStateAction<boolean>>
}

const WalletButtons = ({ setAccounts, setWallet, className, setNoAccounts, setNoExtenstion }: IWalletButtons) => {
	const { api, apiReady, network } = useGlobalApiContext();
	const { loggedInWallet } = useGlobalUserDetailsContext();

	const [selectedWallet, setSelectedWallet] = useState<Wallet>(Wallet.POLKADOT);

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		const wallet = injectedWindow.injectedWeb3[chosenWallet];

		if (!wallet) {
			setNoExtenstion?.(true);
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

		const accounts = await injected.accounts.get();
		if (accounts.length === 0) {
			setNoAccounts?.(true);
			return;
		}

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		setAccounts(accounts);
		if (accounts.length > 0) {
			if(api && apiReady) {
				api.setSigner(injected.signer);
			}
		}
		return;
	};

	useEffect(() => {
		getAccounts(loggedInWallet);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	const handleWalletClick = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, wallet: Wallet) => {
		setAccounts([]);
		setNoAccounts?.(false);
		setNoExtenstion?.(false);
		event.preventDefault();
		setSelectedWallet(wallet);
		setWallet?.(wallet);
		await getAccounts(wallet);
	};

	return (
		<div className={`flex items-center justify-center gap-x-5 mb-2 ${className}`}>
			<WalletButton className={`${selectedWallet === Wallet.POLKADOT? 'border border-solid border-primary bg-highlight': 'border-none'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.POLKADOT)} name="Polkadot" icon={PolkadotWalletIcon} />
			<WalletButton className={`${selectedWallet === Wallet.SUBWALLET? 'border border-solid border-primary bg-highlight': 'border-none'}`} disabled={!apiReady} onClick={(event) => handleWalletClick((event as any), Wallet.SUBWALLET)} name="Subwallet" icon={SubWalletIcon} />
		</div>
	);
};

export default WalletButtons;