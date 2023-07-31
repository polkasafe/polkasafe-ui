// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

export type CurrencySymbol = typeof currencySymbol[keyof typeof currencySymbol];

export interface CurrencyProps {
    'logo'?: any;
    'symbol': CurrencySymbol;
}

export type CurrencyPropType = {
    [index: string]: CurrencyProps;
};


export const currencies = {
	UNITED_STATES_DOLLAR: 'United States Dollar',
	BRITISH_POUND: 'British Pound',
	EURO: 'Euro',
	SWISS_FRANC: 'Swiss Franc',
	UNITED_ARAB_EMIRATES_DIRHAM: 'United Arab Emirates Dirham',
	JAPANESE_YEN: 'Japanese Yen',
	AUSTRALIAN_DOLLAR: 'Australian Dollar',
	CANADIAN_DOLLAR: 'Canadian Dollar',
	INDIAN_RUPEE: 'Indian Rupee'
};

export const currencySymbol = {
	USD: 'USD',
	GBP: 'GBP',
	EUR: 'EUR',
	CHF: 'CHF',
	AED: 'AED',
	JPY: 'JPY',
	AUD: 'AUD',
	CAD: 'CAD',
	INR: 'INR'
};

export const currencyProperties: CurrencyPropType = {
	[currencies.UNITED_STATES_DOLLAR]: {
		symbol: currencySymbol.USD
	},
	[currencies.BRITISH_POUND]: {
		symbol: currencySymbol.GBP
	},
	[currencies.EURO]: {
		symbol: currencySymbol.EUR
	},
	[currencies.SWISS_FRANC]: {
		symbol: currencySymbol.CHF
	},
	[currencies.UNITED_ARAB_EMIRATES_DIRHAM]: {
		symbol: currencySymbol.AED
	},
	[currencies.JAPANESE_YEN]: {
		symbol: currencySymbol.JPY
	},
	[currencies.AUSTRALIAN_DOLLAR]: {
		symbol: currencySymbol.AUD
	},
	[currencies.CANADIAN_DOLLAR]: {
		symbol: currencySymbol.CAD
	},
	[currencies.INDIAN_RUPEE]: {
		symbol: currencySymbol.INR
	}
};