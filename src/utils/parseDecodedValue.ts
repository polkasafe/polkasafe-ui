// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { formatBalance } from '@polkadot/util';
import { chainProperties } from 'src/global/networkConstants';

interface Args {
	value: string;
	network: string;
	withUnit: boolean;
}

export default function parseDecodedValue({ value, network, withUnit = false }: Args): string {
	formatBalance.setDefaults({
		decimals: chainProperties[network].decimals,
		unit: chainProperties[network].ticker
	});

	return formatBalance(value, { forceUnit: chainProperties[network].ticker, withSiFull: false, withUnit });
}