// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { UserDetailsContextType } from 'src/types';
import logout from 'src/utils/logout';

const initialUserDetailsContext : UserDetailsContextType = {
	activeMultisig: localStorage.getItem('active_multisig') || '',
	address: localStorage.getItem('address') || '',
	addressBook: [],
	multisigAddresses: [],
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

	const [userDetailsContextState, setUserDetailsContextState] = useState(initialUserDetailsContext);
	const [loading, setLoading] = useState(false);

	const connectAddress = useCallback(async () => {
		if(!localStorage.getItem('signature') || !localStorage.getItem('address')) return;

		setLoading(true);
		const connectAddressRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddress`, {
			headers: firebaseFunctionsHeader,
			method: 'POST'
		});

		const { data: userData, error: connectAddressErr } = await connectAddressRes.json();

		if(!connectAddressErr && userData){
			setUserDetailsContextState((prevState) => {
				return {
					...prevState,
					address: userData?.address,
					addressBook: userData?.addressBook,
					multisigAddresses: userData?.multisigAddresses
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
					multisigAddresses: []
				};
			});
			navigate('/');
		}
		setLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if(localStorage.getItem('signature')){
			connectAddress();
		} else {
			logout();
			setLoading(false);
			navigate('/');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<UserDetailsContext.Provider value={{ ...userDetailsContextState, setUserDetailsContextState }}>
			{loading ?
				<main className="h-screen w-screen flex items-center justify-center text-2xl bg-bg-main text-white">
					Loading...
				</main> :
				children
			}
		</UserDetailsContext.Provider>
	);
};
