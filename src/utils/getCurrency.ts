// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { currencies } from 'src/global/currencyConstants';
import { Currency } from 'src/types';
/**
 * Return the current network
 *
 */

export default function getCurrency(): Currency {
	const defaultCurrency = currencies.UNITED_STATES_DOLLAR;
	let currency = localStorage.getItem('currency') || defaultCurrency;

	const possibleCurrencies = Object.values(currencies);

	if (!possibleCurrencies.includes(currency)) {
		currency = defaultCurrency;
	}

	return currency;
}
