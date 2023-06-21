// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import SafeApiKit, { OwnerResponse, SafeCreationInfoResponse, SafeInfoResponse, SignatureResponse } from '@safe-global/api-kit';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types';
import { ethers } from 'ethers';

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

		const safeSdk = await Safe.create({ ethAdapter: this.ethAdapter,  isL1SafeMasterCopy: true, safeAddress: multisigAddress });

		const safeTransactionData: SafeTransactionDataPartial = {
			data: '0x00',
			to,
			value
		};

		const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });

		const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
		const hashBytes = ethers.utils.arrayify(safeTxHash);
		const signature = await this.signer.signMessage(hashBytes);

		await this.safeService.proposeTransaction({
			safeAddress: multisigAddress,
			safeTransactionData: safeTransaction.data,
			safeTxHash,
			senderAddress,
			senderSignature: signature.data
		});

		return safeTxHash;
	};

	getPendingTx = async (multisigAddress: string) => {
		return (await this.safeService.getPendingTransactions(multisigAddress)).results;
	};

	getAllCompletedTx = async (multisigAddress: string) => {
		return (await this.safeService.getAllTransactions(multisigAddress, { executed: true, trusted: true }));
	};

	signAndConfirmTx = async (txHash: string) => {
		console.log(txHash);
		const hashBytes = ethers.utils.arrayify(txHash);
		const signature = await this.signer.signMessage(hashBytes);
		return await this.safeService.confirmTransaction(txHash, signature.data);
	};
}