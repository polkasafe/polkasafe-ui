// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { useState } from 'react';
import ConnectWalletImg from 'src/assets/connect-wallet.svg';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { Wallet } from 'src/types';
import { WalletIcon } from 'src/ui-components/CustomIcons';

const ConnectWallet = () => {
	const { login, handleWeb3AuthConnection } = useGlobalWeb3Context();
	const { setUserDetailsContextState } = useGlobalUserDetailsContext();

	const [loading, setLoading] = useState<boolean>(false);

	const handleLogin = async () => {
		try {
			setLoading(true);
			const ethProvider = await login();
			const userData = await handleWeb3AuthConnection(ethProvider);
			setUserDetailsContextState((prevState: any) => {
				return {
					...prevState,
					address: userData?.address,
					addressBook: userData?.addressBook || [],
					createdAt: userData?.created_at,
					loggedInWallet: Wallet.WEB3AUTH,
					multisigAddresses: userData?.multisigAddresses
				};
			});
			setLoading(false);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className='rounded-xl flex flex-col items-center justify-center min-h-[400px] bg-bg-main'>
			<img src={ConnectWalletImg} alt='Wallet' height={120} width={120} className='mb-4 mt-1' />
			<>
				<h2 className='font-bold text-lg text-white'>Get Started</h2>
				<p className='mt-[10px]  text-normal text-sm text-white'>Connect your wallet</p>
				<p className='text-text_secondary text-sm font-normal mt-[20px]'>Your first step towards creating a safe & secure MultiSig</p>
				<Button
					icon={<WalletIcon />}
					onClick={handleLogin}
					loading={loading}
					className={'mt-[25px] text-sm border-none outline-none flex items-center justify-center bg-primary text-white'}
				>
					Connect Wallet
				</Button>
			</>

		</div>
	);
};

export default ConnectWallet;