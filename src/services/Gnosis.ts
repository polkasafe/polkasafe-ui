// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Safe, { EthersAdapter,SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';

// of the Apache-2.0 license. See the LICENSE file for details.
export class GnosisSafeService {
	ethAdapter: ethers.providers.Web3Provider | undefined;
	safeFactory: any;

	constructor(ethersProvider: ethers.providers.Web3Provider) {
		this.ethAdapter = ethersProvider;

	}

	createMultisigWallet = async (_owners: [string], chainId: number) => {

	};
}