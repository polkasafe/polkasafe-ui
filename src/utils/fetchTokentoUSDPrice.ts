// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { chainProperties } from 'src/global/networkConstants';
import { SUBSCAN_API_HEADERS } from 'src/global/subscan_consts';

import formatUSDWithUnits from './formatUSDWithUnits';

export default async function fetchTokenToUSDPrice(token: number, network: string) {

	const response = await fetch(
		`https://${network}.api.subscan.io/api/open/price_converter`,
		{
			body: JSON.stringify({
				from: chainProperties[network]?.tokenSymbol,
				quote: 'USD',
				value: token
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		}
	);

	const responseJSON = await response.json();

	if (responseJSON['message'] == 'Success') {
		return formatUSDWithUnits(responseJSON['data']['output']);
	} else {
		return 'N/A';
	}
}
