// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import React, { useContext, useEffect, useState } from 'react';
import { CURRENCY_API_KEY } from 'src/global/currencyApiKey';
import { currencies, currencyProperties, currencySymbol } from 'src/global/currencyConstants';
import fetchTokenToUSDPrice from 'src/utils/fetchTokentoUSDPrice';
import getCurrency from 'src/utils/getCurrency';

import { useGlobalApiContext } from './ApiContext';

export interface CurrencyContextType {
	currency: string;
	setCurrency: React.Dispatch<React.SetStateAction<string>>;
    currencyPrice: string;
	allCurrencyPrices: {[symbol: string]: { code: string, value: number }};
	tokenUsdPrice: string
}

export const CurrencyContext: React.Context<CurrencyContextType> = React.createContext(
	{} as CurrencyContextType
);

export interface CurrencyContextProviderProps {
	children?: React.ReactElement;
}

export function CurrencyContextProvider({ children }: CurrencyContextProviderProps): React.ReactElement {
	const { network } = useGlobalApiContext();
	const [currency, setCurrency] = useState<string>(getCurrency());
	const [currencyPrice, setCurrencyPrice] = useState<string>('1');
	const [tokenUsdPrice, setTokenUsdPrice] = useState<string>('');

	const [allCurrencyPrices, setAllCurrencyPrices] = useState<{[symbol: string]: { code: string, value: number }}>({});

	useEffect(() => {
		if(!network) return;

		fetchTokenToUSDPrice(1,network).then((formattedUSD) => {
			setTokenUsdPrice(parseFloat(formattedUSD).toFixed(2));
		});
	}, [network]);

	useEffect(() => {
		const fetchCurrencyPrice = async () => {
			const fetchPriceRes = await fetch(`https://api.currencyapi.com/v3/latest?apikey=${CURRENCY_API_KEY}&currencies=${[...Object.values(currencySymbol)]}`, {
				method: 'GET'
			});
			const currencyPrice = await fetchPriceRes.json();
			if(currencyPrice.data){
				setAllCurrencyPrices(currencyPrice.data);
			}
		};
		fetchCurrencyPrice();
	}, []);

	useEffect(() => {
		setCurrency(getCurrency());
		if(Object.keys(allCurrencyPrices).length > 0){
			setCurrencyPrice(allCurrencyPrices[currencyProperties[currency].symbol]?.value?.toString());
		}
		else {
			setCurrency(currencies.UNITED_STATES_DOLLAR);
		}
	}, [allCurrencyPrices, currency]);

	return (
		<CurrencyContext.Provider value={{ allCurrencyPrices, currency, currencyPrice, setCurrency, tokenUsdPrice }}>
			{children}
		</CurrencyContext.Provider>
	);
}

export function useGlobalCurrencyContext() {
	return useContext(CurrencyContext);
}