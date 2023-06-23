// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import React, { useContext,  useState } from 'react';
import getNetwork from 'src/utils/getNetwork';

export interface ApiContextType {
	network: string;
	setNetwork: React.Dispatch<React.SetStateAction<string>>
}

export const ApiContext: React.Context<ApiContextType> = React.createContext(
	{} as ApiContextType
);

export interface ApiContextProviderProps {
	children?: React.ReactElement;
}

export function ApiContextProvider({ children }: ApiContextProviderProps): React.ReactElement {
	const [network, setNetwork] = useState(getNetwork());

	return (
		<ApiContext.Provider value={{ network, setNetwork }}>
			{children}
		</ApiContext.Provider>
	);
}

export function useGlobalApiContext() {
	return useContext(ApiContext);
}