// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import eurLogo from 'src/assets/currency-flags/eur.svg';
import inrLogo from 'src/assets/currency-flags/inr.png';
import usdLogo from 'src/assets/currency-flags/usd.svg';
import { CurrencyPropType } from 'src/types';

export const currencies = {
	EURO: 'Euro',
	INDIAN_RUPEE: 'Indian Rupee',
	UNITED_STATES_DOLLAR: 'United States Dollar'
};

export const currencySymbol = {
	EUR: 'EUR',
	INR: 'INR',
	USD: 'USD'
};

export const currencyProperties: CurrencyPropType = {
	[currencies.INDIAN_RUPEE]: {
		logo: inrLogo,
		symbol: currencySymbol.INR
	},
	[currencies.EURO]: {
		logo: eurLogo,
		symbol: currencySymbol.EUR
	},
	[currencies.UNITED_STATES_DOLLAR]: {
		logo: usdLogo,
		symbol: currencySymbol.USD
	}
};