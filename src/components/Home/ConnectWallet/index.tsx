// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
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
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

const ConnectWallet = () => {

	const { setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network, api, apiReady } = useGlobalApiContext();
	const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	// const { accounts, accountsMap, noAccounts, noExtension, signersMap } = useGetAllAccounts();
	const [address, setAddress] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [signing, setSigning] = useState<boolean>(false);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	const getWalletAccounts = async (chosenWallet: Wallet): Promise<InjectedAccount[] | undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		const wallet = injectedWindow.injectedWeb3[chosenWallet];

		if (!wallet) {
			setExtensionNotFound(true);
			setLoading(false);
			return;
		} else {
			setExtensionNotFound(false);
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
			setAccountsNotFound(true);
			setLoading(false);
			return;
		} else {
			setAccountsNotFound(false);
		}

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		setAccounts(accounts);
		if (accounts && accounts.length > 0) {
			setAddress(accounts[0].address);
		}

		return accounts;
	};

	useEffect(() => {
		getWalletAccounts(Wallet.POLKADOT);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

				const wallet = injectedWindow.injectedWeb3[Wallet.POLKADOT];

				if (!wallet) {
					setExtensionNotFound(true);
					setLoading(false);
					return;
				} else {
					setExtensionNotFound(false);
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

					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							address: userData?.address,
							addressBook: userData?.addressBook || [],
							createdAt: userData?.created_at,
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
			<div className='rounded-xl flex flex-col items-center justify-center min-h-[500px] bg-bg-main'>
				<img src={ConnectWalletImg} alt='Wallet' height={150} width={150} className='mb-4' />
				{
					!api || !apiReady ? <Loader size='large' text='Loading Accounts...' /> :
						extensionNotFound ? <p className='mt-[10px]  text-normal leading-[15px] text-sm text-white text-center'><p className='mb-3'>Extension Not Found.</p><p>Please Install Polkadot-Js Wallet Extension.</p></p> :
							accountsNotFound ? <p className='mt-[10px]  text-normal leading-[15px] text-sm text-white text-center'><p className='mb-3'>No Accounts Found.</p><p>Please Install Polkadot-Js Wallet Extension And Add Accounts.</p></p> :
								<>
									<h2 className='font-bold text-xl leading-[22px] text-white'>Get Started</h2>
									<p className='mt-[10px]  text-normal leading-[15px] text-sm text-white'>Connect your wallet</p>
									<p className='text-text_secondary text-sm leading-[15px] font-normal mt-[30px]'>Your first step towards creating a safe & secure MultiSig</p>
									{
										showAccountsDropdown?
											<div className='mt-[30px]'>
												<AccountSelectionForm
													disabled={loading}
													accounts={accounts}
													address={address}
													onAccountChange={onAccountChange}
													title='Choose linked account'
												/>
											</div>
											: null
									}
									<Button
										icon={<WalletIcon/>}
										size='large'
										loading={loading}
										onClick={async () => showAccountsDropdown ? await handleConnectWallet() : setShowAccountsDropdown(true) }
										className='mt-[60px] border-none outline-none flex items-center justify-center bg-primary text-white max-w-[350px] w-full'
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