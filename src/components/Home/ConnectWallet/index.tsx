// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { message } from 'antd';
import React, { useContext,useEffect, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { APP_NAME } from 'src/global/appName';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import { WalletIcon } from 'src/ui-components/CustomIcons';

const ConnectWallet = () => {
	const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
	const { accounts, noAccounts } = useGetAllAccounts();
	const [address, setAddress] = useState('');
	const { setUserDetailsContextState } = useContext(UserDetailsContext);

	useEffect(() => {
		if (accounts && accounts.length > 0 && !address) {
			setAddress(accounts[0].address);
		}
	}, [accounts, address]);

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	const handleConnectWallet = async  () => {
		if (!accounts.length) {
			return;
		}
		try {
			const injectedWindow = window as Window & InjectedWindow;

			let wallet = isWeb3Injected
				? injectedWindow.injectedWeb3['polkadot-js']
				: null;

			if (!wallet) {
				wallet = Object.values(injectedWindow.injectedWeb3)[0];
			}

			if (!wallet || !wallet.enable) {
				return;
			}

			const injected = await wallet.enable(APP_NAME);

			const signRaw = injected && injected.signer && injected.signer.signRaw;

			if (!signRaw) {
				return console.error('Signer not available');
			}

			const signMessage = process.env.REACT_APP_SIGNING_MSG;

			if (!signMessage) {
				throw new Error('Challenge message not found');
			}

			const { signature } = await signRaw({
				address: address,
				data: stringToHex(signMessage),
				type: 'bytes'
			});
			const res = await fetch('https://us-central1-polkasafe-a8042.cloudfunctions.net/connectAddress', {
				headers: {
					'x-address': address,
					'x-signature': signature
				},
				method: 'POST'
			});
			const data = await res.json();
			if (data) {
				setUserDetailsContextState( prev => ({ ...prev, currentUserAddress: data.address }));
			}
			console.log(data.address);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			<div className='rounded-xl flex flex-col items-center justify-center min-h-[500px] bg-bg-main'>
				{
					!noAccounts?
						<>
							<h2 className='font-bold text-xl leading-[22px] text-white'>Get Started</h2>
							<p className='mt-[10px]  text-normal leading-[15px] text-sm text-white'>Connect your wallet</p>
							<p className='text-text_secondary text-sm leading-[15px] font-normal mt-[30px]'>Your first step towards creating a safe & secure MultiSig</p>
							{
								showAccountsDropdown?
									<div className='mt-[30px]'>
										<AccountSelectionForm
											accounts={accounts}
											address={address}
											onAccountChange={onAccountChange}
											title='Choose linked account'
										/>
									</div>
									: null
							}
							<button
								onClick={async () => {
									await handleConnectWallet();
									message.success('Wallet connected');
									setShowAccountsDropdown(true);
								}}
								className='mt-[60px] p-3 flex items-center justify-center bg-primary text-white gap-x-[10.5px] rounded-lg max-w-[350px] w-full'
							>
								<WalletIcon/>
								<span className='font-normal text-sm leading-[15px]'>
								Connect Wallet
								</span>
							</button>
						</>
						: <h2 className='font-bold text-xl leading-[22px] text-primary'>
							Loading...
						</h2>

				}
			</div>
		</>
	);
};

export default ConnectWallet;