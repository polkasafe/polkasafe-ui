// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { InjectedAccount,InjectedWindow } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import ConnectWalletImg from 'src/assets/connect-wallet.svg';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { APP_NAME } from 'src/global/appName';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IUser } from 'src/types';
import { Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import { WalletIcon } from 'src/ui-components/CustomIcons';
import Loader from 'src/ui-components/Loader';
import WalletButtons from 'src/ui-components/WalletButtons';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

const ConnectWallet = () => {

	const { setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network, api, apiReady } = useGlobalApiContext();
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
	const [address, setAddress] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [signing, setSigning] = useState<boolean>(false);
	const [noAccounts, setNoAccounts] = useState<boolean>(false);
	const [noExtension, setNoExtension] = useState<boolean>(false);
	const [selectedWallet, setSelectedWallet] = useState<Wallet>(Wallet.POLKADOT);

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	useEffect(() => {
		if (accounts && accounts.length > 0) {
			setAddress(accounts[0].address);
		}
	}, [accounts]);

	const handleConnectWallet = async () => {
		try {
			const substrateAddress = getSubstrateAddress(address);

			// TODO - error state
			if(!substrateAddress){
				console.log('INVALID SUBSTRATE ADDRESS');
				return;
			}

			setLoading(true);

			const tokenResponse = await fetch(`${FIREBASE_FUNCTIONS_URL}/getConnectAddressToken`, {
				headers: {
					'x-address': substrateAddress
				},
				method: 'POST'
			});

			const { data: token, error: tokenError } = await tokenResponse.json();

			if(tokenError) {
				// TODO extension
				console.log('ERROR', tokenError);
				setLoading(false);
				return;
			} else {
				const injectedWindow = window as Window & InjectedWindow;

				const wallet = injectedWindow.injectedWeb3[selectedWallet];

				if (!wallet) {
					setLoading(false);
					return;
				}
				const injected = wallet && wallet.enable && await wallet.enable(APP_NAME);

				const signRaw = injected && injected.signer && injected.signer.signRaw;
				if (!signRaw) console.error('Signer not available');
				setSigning(true);
				// @ts-ignore
				const { signature } = await signRaw({
					address: substrateAddress,
					data: stringToHex(token),
					type: 'bytes'
				});

				setSigning(false);

				const connectAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddress`, {
					headers: firebaseFunctionsHeader(network, substrateAddress, signature),
					method: 'POST'
				});

				const { data: userData, error: connectAddressErr } = await connectAddressRes.json() as { data: IUser, error: string };

				if(!connectAddressErr && userData){
					localStorage.setItem('address', substrateAddress);
					localStorage.setItem('signature', signature);
					localStorage.setItem('logged_in_wallet', selectedWallet);

					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							address: userData?.address,
							addressBook: userData?.addressBook || [],
							createdAt: userData?.created_at,
							loggedInWallet: selectedWallet,
							multisigAddresses: userData?.multisigAddresses,
							multisigSettings: userData?.multisigSettings || {}
						};
					});
					setLoading(false);
					setSigning(false);
				}
			}
		} catch (error){
			console.log('ERROR OCCURED', error);
			setLoading(false);
			setSigning(false);
		}
	};

	return (
		<>
			<div className='rounded-xl flex flex-col items-center justify-center min-h-[400px] bg-bg-main'>
				<img src={ConnectWalletImg} alt='Wallet' height={120} width={120} className='mb-4 mt-1' />
				{
					!api || !apiReady ? <Loader size='large' text='Loading Accounts...' /> :
						<>
							<h2 className='font-bold text-lg text-white'>Get Started</h2>
							<p className='mt-[10px]  text-normal text-sm text-white'>Connect your wallet</p>
							<p className='text-text_secondary text-sm font-normal mt-[20px]'>Your first step towards creating a safe & secure MultiSig</p>
							{
								showAccountsDropdown?
									<div className='mt-[20px]'>
										<WalletButtons setNoAccounts={setNoAccounts} setNoExtenstion={setNoExtension} className='mb-4' setWallet={setSelectedWallet} setAccounts={setAccounts} />
										{
											noExtension ?
												<p className='mt-[10px]  text-normal text-sm text-white text-center'>Please Install {selectedWallet === Wallet.POLKADOT ? 'Polkadot-Js' : 'Subwallet'} Extension.</p> :
												noAccounts ? <p className='mt-[10px]  text-normal text-sm text-white text-center'>No Accounts Found. Please Install the Extension And Add Accounts.</p> :
													<AccountSelectionForm
														disabled={loading}
														accounts={accounts}
														address={address}
														onAccountChange={onAccountChange}
														title='Choose linked account'
													/>
										}
									</div>
									: null
							}
							<Button
								disabled={(noExtension || noAccounts || !address) && showAccountsDropdown}
								icon={<WalletIcon/>}
								loading={loading}
								onClick={async () => showAccountsDropdown ? await handleConnectWallet() : setShowAccountsDropdown(true) }
								className={`mt-[25px] text-sm border-none outline-none flex items-center justify-center ${(noExtension || noAccounts || !address) && showAccountsDropdown ? 'bg-highlight text-text_secondary' : 'bg-primary text-white'} max-w-[320px] w-full`}
							>
								Connect Wallet
							</Button>
							{signing && <div className='text-white mt-1'>Please Sign This Randomly Generated Text To Login.</div>}
						</>

				}
			</div>
		</>
	);
};

export default ConnectWallet;