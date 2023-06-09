// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getParsedEthersError } from '@enzoferey/ethers-error-parser';
import SafeApiKit from '@safe-global/api-kit';
import  { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';

// of the Apache-2.0 license. See the LICENSE file for details.
export class GnosisSafeService {
	ethAdapter: any;
	safeFactory: any;
	signer: any;
	safeService: any;

	constructor(ethersProvider: any, signer: any, txServiceURL: any) {
		this.ethAdapter = ethersProvider;
		this.signer = signer;
		this.safeService = new SafeApiKit({ ethAdapter: this.ethAdapter, txServiceUrl: txServiceURL });

	}

	createSafe = async (owners: [string], threshold: number) => {
		try {
			const safeAccountConfig: SafeAccountConfig = {
				owners,
				threshold
			};

			const safeFactory = await SafeFactory.create({ ethAdapter: this.ethAdapter });

			const safe = await safeFactory.deploySafe({ safeAccountConfig,
			options: {
				gasLimit: 500000
			} });
			const safeAddress = await safe.getAddress();
			console.log('yash safeAddress', safeAddress);
		} catch (err) {
			console.log('error from createSafe', err);
			const parsedEthersError = getParsedEthersError(err);
			console.log('yash error from creation', parsedEthersError);
		}
	};
}