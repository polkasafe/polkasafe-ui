// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { chainProperties } from 'src/global/networkConstants';

import formatBnBalance from './formatBnBalance';
import getEncodedAddress from './getEncodedAddress';

export default async function hasExistentialDeposit(api: ApiPromise, address: string, network: string): Promise<boolean> {
	if (!api || !address || !network) return false;

	const encodedAddress = getEncodedAddress(address, network);
	if (!encodedAddress) return false;

	try {
		const balanceRes = await api.query.system.account(encodedAddress);
		const balance = Number(formatBnBalance(balanceRes?.data?.free?.toString() || '0', { numberAfterComma: 12, withThousandDelimitor: false, withUnit: false }, network));
		return Number(balance) >= Number(chainProperties[network]);
	} catch (e) {
		console.log('hasExistentialDeposit error', e);
		return false;
	}

}