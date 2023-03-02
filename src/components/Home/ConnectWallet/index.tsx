// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { stringToHex } from '@polkadot/util';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import useGetAllAccounts from 'src/hooks/useGetAllAccounts';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import { WalletIcon } from 'src/ui-components/CustomIcons';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

const ConnectWallet = () => {

	const { setUserDetailsContextState } = useGlobalUserDetailsContext();

	const [showAccountsDropdown, setShowAccountsDropdown] = useState(false);
	const { accounts, accountsMap, noAccounts, noExtension, signersMap } = useGetAllAccounts();
	const [address, setAddress] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (accounts && accounts.length > 0 && !address) {
			setAddress(accounts[0].address);
		}
	}, [accounts, address]);

	const onAccountChange = (address: string) => {
		setAddress(address);
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
				console.log('ERROR TODO', tokenError);
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
					headers: {
						'x-address': substrateAddress,
						'x-signature': signature
					},
					method: 'POST'
				});

				const { data: userData, error: connectAddressErr } = await connectAddressRes.json();

				if(!connectAddressErr && userData){
					localStorage.setItem('address', substrateAddress);
					localStorage.setItem('signature', signature);

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
						: <h2 className='font-bold text-xl leading-[22px] text-primary'>
							Loading...
						</h2>

				}
			</div>
		</>
	);
};

export default ConnectWallet;