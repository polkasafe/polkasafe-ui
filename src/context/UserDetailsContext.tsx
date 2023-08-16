// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { UserDetailsContextType, Wallet } from 'src/types';

import { useGlobalApiContext } from './ApiContext';
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

export const UserDetailsContext: React.Context<UserDetailsContextType> = createContext(initialUserDetailsContext);

export function useGlobalUserDetailsContext() {
	return useContext(UserDetailsContext);
}

export const UserDetailsProvider = ({ children }: React.PropsWithChildren<{}>) => {
	const [userDetailsContextState, setUserDetailsContextState] = useState(initialUserDetailsContext);
	const [activeMultisigTxs, setActiveMultisigTxs] = useState<any[]>([]);
	const [activeMultisigData, setActiveMultisigData] = useState<any>({});
	const { ethProvider } = useGlobalWeb3Context();
	const { network } = useGlobalApiContext();
	const { switchChain, addChain } = useGlobalWeb3Context();

	const [loading, setLoading] = useState(false);

	const address = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');

	const fetchUserData = async () => {
		setLoading(true);
		console.log('connectAddressEth');
		const { data } = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddressEth`, {
			headers: firebaseFunctionsHeader(network, address!, signature!),
			method: 'POST'
		}).then(res => res.json());

		if (data?.multisigAddresses.length > 0) localStorage.setItem('activeMultisig', data?.multisigAddresses[0].address);

		setUserDetailsContextState((prevState) => {
			return {
				...prevState,
				activeMultisig: data?.multisigAddresses.length > 0 ? data?.multisigAddresses[0].address : '',
				address: data?.address,
				addressBook: data?.addressBook || [],
				createdAt: data?.created_at,
				loggedInWallet: Wallet.WEB3AUTH,
				multisigAddresses: data?.multisigAddresses
			};
		});
		setLoading(false);
	};

	useEffect(() => {
		if (address) fetchUserData();
		const chains = async () => {
			await addChain(network);
			await switchChain(chainProperties[network].chainId);
		};

		chains();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (userDetailsContextState.activeMultisig && ethProvider) fetchMultisigData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDetailsContextState.activeMultisig, ethProvider]);

	const fetchMultisigData = async () => {
		try {
			setLoading(true);
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
			setLoading(false);
		} catch (err) {
			setLoading(false);
			console.log('err from fetchMultisigData', err);
		}
	};

	return (
		<UserDetailsContext.Provider value={{ activeMultisigData, activeMultisigTxs, fetchMultisigData, fetchUserData, loading, ...userDetailsContextState, setLoading, setUserDetailsContextState }}>
			{children}
		</UserDetailsContext.Provider>
	);
};
