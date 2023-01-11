// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { encodeAddress } from '@polkadot/util-crypto';
import { chainProperties } from 'src/global/networkConstants';
import getNetwork from 'src/utils/getNetwork';

/**
 * Return an address encoded for the current network
 *
 * @param address An address
 *
 */
export default function getEncodedAddress(address: string): string | null {
	const network = getNetwork();
	const ss58Format = chainProperties?.[network]?.ss58Format;

	if (!network || ss58Format === undefined) {
		return null;
	}

	try{
		return encodeAddress(address, ss58Format);
	} catch(e) {
		console.error('getEncodedAddress error', e);
		return null;
	}
}
