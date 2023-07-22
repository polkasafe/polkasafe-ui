// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import { ApiPromise, WsProvider } from '@polkadot/api';
import React, { useContext, useEffect, useState } from 'react';
import { chainProperties } from 'src/global/networkConstants';
import getCurrency from 'src/utils/getCurrency';
import getNetwork from 'src/utils/getNetwork';

export interface ApiContextType {
	api: ApiPromise | undefined;
	apiReady: boolean;
	network: string;
	setNetwork: React.Dispatch<React.SetStateAction<string>>;
	currency: string;
	setCurrency: React.Dispatch<React.SetStateAction<string>>;
}

export const ApiContext: React.Context<ApiContextType> = React.createContext(
	{} as ApiContextType
);

export interface ApiContextProviderProps {
	children?: React.ReactElement;
}

export function ApiContextProvider({ children }: ApiContextProviderProps): React.ReactElement {
	const [api, setApi] = useState<ApiPromise>();
	const [apiReady, setApiReady] = useState(false);
	const [network, setNetwork] = useState(getNetwork());
	const [currency, setCurrency] = useState<string>(getCurrency());

	useEffect(() => {
		const provider = new WsProvider(chainProperties[network].rpcEndpoint);
		setApiReady(false);
		setApi(new ApiPromise({ provider }));
	},[network]);

	useEffect(() => {
		if(api){
			api.isReady.then(() => {
				setApiReady(true);
				console.log('API ready');
			})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [api]);

	return (
		<ApiContext.Provider value={{ api, apiReady, currency, network, setCurrency, setNetwork }}>
			{children}
		</ApiContext.Provider>
	);
}

export function useGlobalApiContext() {
	return useContext(ApiContext);
}