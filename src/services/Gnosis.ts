// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import SafeApiKit from '@safe-global/api-kit';
import Safe, { EthersAdapter, SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { ethers } from 'ethers';

// of the Apache-2.0 license. See the LICENSE file for details.
export class GnosisSafeService {
	ethAdapter: any;
	safeFactory: any;
	signer: any;
	safeService: any;

	constructor(ethersProvider: any, signer: any, txServiceURL: any) {
		this.ethAdapter = ethersProvider;
		this.signer = signer;
		this.safeService = new SafeApiKit({ txServiceUrl: txServiceURL, ethAdapter: this.ethAdapter });

	}

	createSafe = async (owners: [string], threshold: number, chainId?: number) => {
		const safeAccountConfig: SafeAccountConfig = {
			owners,
			threshold
		}

		const safe = await this.safeFactory.deploySafe({ safeAccountConfig })
		const safeAddress = await safe.getAddress()
		console.log("yash safeAddress", safeAddress)
	};
}