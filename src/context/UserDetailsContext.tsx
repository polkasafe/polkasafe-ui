// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { createContext, useState } from 'react';
import { UserDetailsContextType } from 'src/types';

const initialUserDetailsContext : UserDetailsContextType = {
	addresses: [],
	currentUserAddress: '',
	setUserDetailsContextState : (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	}
};

export const UserDetailsContext = createContext(initialUserDetailsContext);

export const UserDetailsProvider = ({ children }: React.PropsWithChildren<{}>) => {

	const [userDetailsContextState, setUserDetailsContextState] = useState(initialUserDetailsContext);

	console.log(userDetailsContextState);

	return (
		<UserDetailsContext.Provider value={{ ...userDetailsContextState, setUserDetailsContextState }}>
			{children}
		</UserDetailsContext.Provider>
	);
};
