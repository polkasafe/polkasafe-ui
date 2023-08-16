// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EthersAdapter, Web3Adapter } from '@safe-global/protocol-kit';

export const createAdapter = (type: 'web3' | 'eth', provider: any): EthersAdapter | Web3Adapter | null => {
	if (type === 'web3') {
		return new Web3Adapter({
			web3: provider
		});
	} else {
		return new EthersAdapter({
			ethers: provider,
			signerOrProvider: provider.getSigner()
		});
	}

};