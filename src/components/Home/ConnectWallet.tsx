// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import React, { useEffect, useState } from 'react';
import { APP_NAME } from 'src/global/appName';
import { Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import { WalletIcon } from 'src/ui-components/CustomIcons';
import getEncodedAddress from 'src/utils/getEncodedAddress';

const ConnectWallet = () => {
	const [, setWalletError] = useState('');
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState('');
	const [chosenWallet] = useState(Wallet.POLKADOT);
	const [, setIsAccountLoading] = useState(true);
	const [, setExtensionNotFound] = useState(false);
	const [, setAccountsNotFound] = useState(false);

	useEffect(() => {
		if (!accounts.length) {
			getAccounts(chosenWallet);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chosenWallet]);

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		let wallet = isWeb3Injected
			? injectedWindow.injectedWeb3[chosenWallet]
			: null;

		if (!wallet) {
			wallet = Object.values(injectedWindow.injectedWeb3)[0];
		}
		if (!wallet) {
			setExtensionNotFound(true);
			setIsAccountLoading(false);
			return;
		} else {
			setExtensionNotFound(false);

			let injected: Injected | undefined;
			try {
				injected = await new Promise((resolve, reject) => {
					const timeoutId = setTimeout(() => {
						reject(new Error('Wallet Timeout'));
					}, 60000); // wait 60 sec
					if (wallet && wallet.enable) {
						wallet.enable(APP_NAME)
							.then((value) => { clearTimeout(timeoutId); resolve(value); })
							.catch((error) => { reject(error); });
					} else {
						reject(new Error('No wallet'));
					}
				});
			} catch (err) {
				setIsAccountLoading(false);
				console.log(err?.message);
				if (err?.message == 'Rejected') {
					setWalletError('');
				} else if (
					err?.message == 'Pending authorization request already exists for this site. Please accept or reject the request.'
				) {
					setWalletError(
						'Pending authorization request already exists. Please accept or reject the request on the wallet extension and try again.'
					);
				} else if (err?.message == 'Wallet Timeout') {
					setWalletError(
						'Wallet authorization timed out. Please accept or reject the request on the wallet extension and try again.'
					);
				}
			}
			if (!injected) {
				return;
			}

			const accounts = await injected.accounts.get();
			if (accounts.length === 0) {
				setAccountsNotFound(true);
				setIsAccountLoading(false);
				return;
			} else {
				setAccountsNotFound(false);
			}

			accounts.forEach((account) => {
				account.address = getEncodedAddress(account.address) || account.address;
			});

			setAccounts(accounts);
			if (accounts.length > 0) {
				setAddress(accounts[0].address);
			}

			setIsAccountLoading(false);
			return;
		}
	};

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	return (
		<div className='rounded-xl flex flex-col items-center justify-center min-h-[500px] bg-bg-main'>
			<h2 className='font-bold text-xl leading-[22px] text-white'>Get Started</h2>
			<p className='mt-[10px]  text-normal leading-[15px] text-sm text-white'>Connect your wallet</p>
			<p className='text-text_secondary text-sm leading-[15px] font-normal mt-[30px]'>Your first step towards creating a safe & secure MultiSig</p>
			<div className='mt-[30px]'>
				<AccountSelectionForm accounts={accounts} address={address} onAccountChange={onAccountChange} title='Choose linked account' />
			</div>
			<button className='mt-[60px] p-3 flex items-center justify-center bg-primary text-white gap-x-[10.5px] rounded-lg max-w-[350px] w-full'>
				<WalletIcon/>
				<span className='font-normal text-sm leading-[15px]'>
                    Connect Wallet
				</span>
			</button>
		</div>
	);
};

export default ConnectWallet;