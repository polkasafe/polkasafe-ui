// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
/* eslint-disable no-tabs */

import React, { createContext, useContext, useState } from 'react';
import { ISharedAddressBooks } from 'src/types';

import { useGlobalUserDetailsContext } from './UserDetailsContext';

export interface IActiveMultisigContext extends ISharedAddressBooks {
    setActiveMultisigContextState: React.Dispatch<React.SetStateAction<IActiveMultisigContext>>
}

export const initialActiveMultisigContext: IActiveMultisigContext = {
	records: {},
	multisig: '',
	setActiveMultisigContextState: (): void => {
		throw new Error('setActiveMultisigContextState function must be overridden');
	}
};

export const ActiveMultisigContext = createContext(initialActiveMultisigContext);

export function useActiveMultisigContext() {
	return useContext(ActiveMultisigContext);
}

export const ActiveMultisigProvider = ({ children }: React.PropsWithChildren<{}>) => {
	// const { network } = useGlobalApiContext();
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	const [activeMultisigContextState, setActiveMultisigContextState] = useState<IActiveMultisigContext>(initialActiveMultisigContext);

	return (
		<ActiveMultisigContext.Provider value={{ ...activeMultisigContextState, setActiveMultisigContextState }}>
			{children}
		</ActiveMultisigContext.Provider>
	);
};
