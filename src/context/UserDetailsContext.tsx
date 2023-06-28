// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { UserDetailsContextType, Wallet } from 'src/types';

import { useGlobalWeb3Context } from './Web3Auth';

const initialUserDetailsContext: UserDetailsContextType = {
	activeMultisig: localStorage.getItem('active_multisig') || '',
	address: localStorage.getItem('address') || '',
	addressBook: [],
	createdAt: new Date(),
	loggedInWallet: Wallet.WEB3AUTH,
	multisigAddresses: [],
	setUserDetailsContextState: (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	}
};

export const UserDetailsContext: React.Context<any> = createContext(initialUserDetailsContext);

export function useGlobalUserDetailsContext() {
	return useContext(UserDetailsContext);
}

export const UserDetailsProvider = ({ children }: React.PropsWithChildren<{}>) => {
	const [userDetailsContextState, setUserDetailsContextState] = useState(initialUserDetailsContext);
	const [activeMultisigTxs, setActiveMultisigTxs] = useState<any[]>([]);
	const [activeMultisigData, setActiveMultisigData] = useState<any>({});
	const { ethProvider } = useGlobalWeb3Context();

	useEffect(() => {
		const address = localStorage.getItem('address');
		const signature = localStorage.getItem('signature');
		const fetchUserData = async () => {
			const { data } = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddressEth`, {
				headers: firebaseFunctionsHeader('goerli', address!, signature!),
				method: 'POST'
			}).then(res => res.json());

			setUserDetailsContextState((prevState) => {
				return {
					...prevState,
					address: data?.address,
					addressBook: data?.addressBook || [],
					createdAt: data?.created_at,
					loggedInWallet: Wallet.WEB3AUTH,
					multisigAddresses: data?.multisigAddresses
				};
			});
		};

		if (address && address) fetchUserData();
	}, []);

	useEffect(() => {
		if (userDetailsContextState.activeMultisig && ethProvider) fetchMultisigData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetailsContextState.activeMultisig, ethProvider]);

	const fetchMultisigData = async () => {
		try {
			const { data } = await fetch(`${FIREBASE_FUNCTIONS_URL}/getAllTransaction`, {
				headers: {
					'Accept': 'application/json',
					'Acess-Control-Allow-Origin': '*',
					'Content-Type': 'application/json',
					'x-address': userDetailsContextState.address,
					'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
					'x-multisig': userDetailsContextState.activeMultisig,
					'x-signature': localStorage.getItem('signature')!,
					'x-source': 'polkasafe'
				},
				method: 'GET'
			}).then(res => res.json());
			const safeBalance = await ethProvider?.getBalance(userDetailsContextState.activeMultisig);
			setActiveMultisigData({ safeBalance });

			setActiveMultisigTxs(data);
		} catch (err) {
			console.log('err from fetchMultisigData', err);
		}
	};

	return (
		<UserDetailsContext.Provider value={{ activeMultisigData, activeMultisigTxs, ...userDetailsContextState, setUserDetailsContextState }}>
			{children}
		</UserDetailsContext.Provider>
	);
};
