// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { stringToHex } from '@polkadot/util';
import { Button } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import { IAddressBookEntry } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import { WalletIcon } from 'src/ui-components/CustomIcons';
import Loader from 'src/ui-components/Loader';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

const ConnectWallet = () => {

	const { setUserDetailsContextState } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
	const { accounts, accountsMap, noAccounts, noExtension, signersMap } = useGetAllAccounts();
	const [address, setAddress] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (accounts && accounts.length > 0) {
			setAddress(accounts[0].address);
		}
	}, [accounts, network]);

	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	const handleAddAddress = async (address: string, name: string) => {
		try{
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else{

				const addAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addToAddressBook`, {
					body: JSON.stringify({
						address,
						name
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: addAddressData, error: addAddressError } = await addAddressRes.json() as { data: IAddressBookEntry[], error: string };

				if(addAddressError) {
					return;
				}

				if(addAddressData){
					setUserDetailsContextState((prevState) => {
						return {
							...prevState,
							addressBook: addAddressData
						};
					});

				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	};

	const addToAddressBook = async () => {
		for(const account of accounts){
			await handleAddAddress(account.address, account.name || DEFAULT_ADDRESS_NAME);
		}
	};

	const handleConnectWallet = async () => {
		if(noExtension || noAccounts) return;
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
				const wallet = accountsMap[address];

				if(!signersMap[wallet]){
					// error state - please add ...
					setLoading(false);
					return;
				}
				// @ts-ignore
				const { signature } = await signersMap[wallet].signRaw({
					address: substrateAddress,
					data: stringToHex(token),
					type: 'bytes'
				});

				const connectAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddress`, {
					headers: firebaseFunctionsHeader(network, substrateAddress, signature),
					method: 'POST'
				});

				const { data: userData, error: connectAddressErr } = await connectAddressRes.json();

				if(!connectAddressErr && userData){
					localStorage.setItem('address', substrateAddress);
					localStorage.setItem('signature', signature);

					if((dayjs(userData.created_at) > dayjs().add(-3, 'minutes'))){
						setUserDetailsContextState((prevState) => {
							return {
								...prevState,
								address: userData?.address,
								multisigAddresses: userData?.multisigAddresses
							};
						});
						setLoading(false);
						addToAddressBook();
					}
					else{
						setUserDetailsContextState((prevState) => {
							return {
								...prevState,
								address: userData?.address,
								addressBook: userData?.addressBook,
								multisigAddresses: userData?.multisigAddresses
							};
						});
						setLoading(false);
					}
				}
			}
		} catch (error){
			console.log('ERROR OCCURED', error);
			setLoading(false);
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
							<Button
								icon={<WalletIcon/>}
								size='large'
								loading={loading}
								onClick={async () => showAccountsDropdown ? await handleConnectWallet() : setShowAccountsDropdown(true) }
								className='mt-[60px] border-none outline-none flex items-center justify-center bg-primary text-white max-w-[350px] w-full'
							>
								Connect Wallet
							</Button>
						</>
						: <Loader size='large' />

				}
			</div>
		</>
	);
};

export default ConnectWallet;