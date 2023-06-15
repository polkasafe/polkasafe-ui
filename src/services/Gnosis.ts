// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getParsedEthersError } from '@enzoferey/ethers-error-parser';
import SafeApiKit, { OwnerResponse, ProposeTransactionProps, SafeCreationInfoResponse, SafeInfoResponse, SignatureResponse } from '@safe-global/api-kit';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { SafeTransactionData, SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';

// of the Apache-2.0 license. See the LICENSE file for details.
export class GnosisSafeService {
	ethAdapter: any;
	safeFactory: any;
	signer: any;
	safeService: SafeApiKit;

	constructor(ethersProvider: any, signer: any, txServiceURL: any) {
		this.ethAdapter = ethersProvider;
		this.signer = signer;
		this.safeService = new SafeApiKit({ ethAdapter: this.ethAdapter, txServiceUrl: txServiceURL });

	}

	createSafe = async (owners: [string], threshold: number): Promise<string> => {
		try {
			const safeAccountConfig: SafeAccountConfig = {
				owners,
				threshold
			};

			const safeFactory = await SafeFactory.create({ ethAdapter: this.ethAdapter });

			const safe = await safeFactory.deploySafe({
				options: {
					gasLimit: 1000000
				},
				safeAccountConfig
			});
			const safeAddress = await safe.getAddress();
			return safeAddress;
		} catch (err) {
			console.log('error from createSafe', err);
			const parsedEthersError = getParsedEthersError(err);
			console.log('yash error from creation', parsedEthersError);
			return '';
		}
	};

	getAllSafesByOwner = async (ownerAddress: string): Promise<OwnerResponse> => {
		return await this.safeService.getSafesByOwner(ownerAddress);
	};

	getSafeInfoByAddress = async (safeAddress: string): Promise<SafeInfoResponse> => {
		return await this.safeService.getSafeInfo(safeAddress);
	};

	confirmTxByHash = async (txHash: string, signature: any): Promise<SignatureResponse> => {
		return await this.safeService.confirmTransaction(txHash, signature);
	};

	getSafeCreationInfo = async (safeAddress: string): Promise<SafeCreationInfoResponse> => {
		return await this.safeService.getSafeCreationInfo(safeAddress);
	};

	createSafeTx = async (multisigAddress: string, to: string, value: string, senderAddress: string) => {

		console.log(multisigAddress, to,value, senderAddress);

		const safeSdk = await Safe.create({ ethAdapter: this.ethAdapter, safeAddress: multisigAddress, isL1SafeMasterCopy: true });

		const safeTransactionData: SafeTransactionDataPartial = {
			to,
			data: '0x00',
			value
		};

		const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });

		const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
		console.log(safeTxHash);
		const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

		await this.safeService.proposeTransaction({
			safeAddress: multisigAddress,
			safeTransactionData: safeTransaction.data,
			safeTxHash,
			senderAddress,
			senderSignature: senderSignature.data
		});
	};

	getPendingTx = async (multisigAddress: string) => {
		return (await this.safeService.getPendingTransactions(multisigAddress)).results;
	};
}