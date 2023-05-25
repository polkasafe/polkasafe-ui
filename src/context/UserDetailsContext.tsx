// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IUser, Triggers, UserDetailsContextType, Wallet } from 'src/types';
import Loader from 'src/ui-components/Loader';
import logout from 'src/utils/logout';

import { useGlobalApiContext } from './ApiContext';

const initialUserDetailsContext : UserDetailsContextType = {
	activeMultisig: localStorage.getItem('active_multisig') || '',
	address: localStorage.getItem('address') || '',
	addressBook: [],
	createdAt: new Date(),
	isProxy: false,
	loggedInWallet: Wallet.POLKADOT,
	multisigAddresses: [],
	multisigSettings: {},
	notification_preferences: {
		channelPreferences: {},
		triggerPreferences:{
			[Triggers.CANCELLED_TRANSACTION]: {
				enabled: false,
				name: Triggers.CANCELLED_TRANSACTION
			},
			[Triggers.EXECUTED_TRANSACTION]: {
				enabled: false,
				name: Triggers.EXECUTED_TRANSACTION
			},
			[Triggers.EDIT_MULTISIG_USERS_EXECUTED]: {
				enabled: false,
				name: Triggers.EDIT_MULTISIG_USERS_EXECUTED
			},
			[Triggers.EXECUTED_PROXY]:{
				enabled: false,
				name: Triggers.EXECUTED_PROXY
			},
			[Triggers.INIT_MULTISIG_TRANSFER]:{
				enabled: false,
				name: Triggers.INIT_MULTISIG_TRANSFER
			},
			[Triggers.CREATED_PROXY]:{
				enabled: false,
				name: Triggers.CREATED_PROXY
			},
			[Triggers.EDIT_MULTISIG_USERS_START]:{
				enabled: false,
				name: Triggers.EDIT_MULTISIG_USERS_START
			}
		}
	},
	notifiedTill: localStorage.getItem('notifiedTill') ? dayjs(localStorage.getItem('notifiedTill')).toDate() : null,
	setUserDetailsContextState : (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	}
};

export const UserDetailsContext = createContext(initialUserDetailsContext);

export function useGlobalUserDetailsContext() {
	return useContext(UserDetailsContext);
}

export const UserDetailsProvider = ({ children }: React.PropsWithChildren<{}>) => {
	const navigate = useNavigate();
	const { network } = useGlobalApiContext();

	const [userDetailsContextState, setUserDetailsContextState] = useState(initialUserDetailsContext);
	const [loading, setLoading] = useState(false);

	const connectAddress = useCallback(async () => {
		if(!localStorage.getItem('signature') || !localStorage.getItem('address')) return;

		setLoading(true);
		const connectAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddress`, {
			headers: firebaseFunctionsHeader(network),
			method: 'POST'
		});

		const { data: userData, error: connectAddressErr } = await connectAddressRes.json() as { data: IUser, error: string };

		if(!connectAddressErr && userData){
			setUserDetailsContextState((prevState) => {
				return {
					...prevState,
					activeMultisig: localStorage.getItem('active_multisig') || '',
					address: userData?.address,
					addressBook: userData?.addressBook || [],
					createdAt: userData?.created_at,
					loggedInWallet: localStorage.getItem('logged_in_wallet') as Wallet || Wallet.POLKADOT,
					multisigAddresses: userData?.multisigAddresses,
					multisigSettings: userData?.multisigSettings || {},
					notification_preferences: userData?.notification_preferences || initialUserDetailsContext.notification_preferences
				};
			});
		}else {
			logout();
			setUserDetailsContextState(prevState => {
				return {
					...prevState,
					activeMultisig: localStorage.getItem('active_multisig') || '',
					address: '',
					addressBook: [],
					loggedInWallet: Wallet.POLKADOT,
					multisigAddresses: [],
					multisigSettings: {}
				};
			});
			navigate('/');
		}
		setLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if(localStorage.getItem('signature')){
			connectAddress();
		} else {
			logout();
			setLoading(false);
			navigate('/');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectAddress]);

	return (
		<UserDetailsContext.Provider value={{ ...userDetailsContextState, setUserDetailsContextState }}>
			{loading ?
				<main className="h-screen w-screen flex items-center justify-center text-2xl bg-bg-main text-white">
					<Loader size='large' />
				</main> :
				children
			}
		</UserDetailsContext.Provider>
	);
};
