// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK } from './networkConstants';

export const returnTxUrl = (network?: NETWORK): string => {
	if (network === NETWORK.GOERLI) {
		return 'https://safe-transaction-goerli.safe.global';
	} else if (network === NETWORK.POLYGON) {
		return 'https://safe-transaction-polygon.safe.global';
	} else if (network === NETWORK.ASTAR) {
		return 'http://143.110.188.163:8000/txs';
	} else {
		return '';
	}
};