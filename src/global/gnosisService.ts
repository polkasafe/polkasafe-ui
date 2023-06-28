// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const returnTxUrl = (network?: 'goerli') : string =>  {
	if (network === 'goerli') {
		return 'https://safe-transaction-goerli.safe.global';
	} else {
		return '';
	}
};