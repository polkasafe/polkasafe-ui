// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import SafeApiKit, { AllTransactionsListResponse, OwnerResponse, SafeCreationInfoResponse, SafeInfoResponse, SignatureResponse } from '@safe-global/api-kit';
import Safe, { SafeAccountConfig, SafeFactory } from '@safe-global/protocol-kit';
import { SafeMultisigTransactionResponse, SafeTransactionDataPartial, TransactionResult } from '@safe-global/safe-core-sdk-types';

(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

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

	createSafe = async (owners: [string], threshold: number): Promise<string | undefined> => {
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
		}
	};

	getAllSafesByOwner = async (ownerAddress: string): Promise<OwnerResponse | null> => {
		try {
			return await this.safeService.getSafesByOwner(ownerAddress);
		} catch (err) {
			console.log('error from getAllSafesByOwner', err);
			return null;
		}
	};

	getSafeInfoByAddress = async (safeAddress: string): Promise<SafeInfoResponse | null> => {
		try {
			return await this.safeService.getSafeInfo(safeAddress);
		} catch (err) {
			console.log('error from getSafeInfoByAddress', err);
			return null;
		}
	};

	confirmTxByHash = async (txHash: string, signature: any): Promise<SignatureResponse | null> => {
		try {
			return await this.safeService.confirmTransaction(txHash, signature);
		} catch (err) {
			console.log('error from confirmTxByHash', err);
			return null;
		}
	};

	getSafeCreationInfo = async (safeAddress: string): Promise<SafeCreationInfoResponse | null> => {
		try {
			return await this.safeService.getSafeCreationInfo(safeAddress);
		} catch (err) {
			console.log('error from getSafeCreationInfo', err);
			return null;
		}
	};

	createSafeTx = async (multisigAddress: string, to: string, value: string, senderAddress: string): Promise<string | null> => {
		try {
			const safeSdk = await Safe.create({ ethAdapter: this.ethAdapter, isL1SafeMasterCopy: true, safeAddress: multisigAddress });

			const safeTransactionData: SafeTransactionDataPartial = {
				data: '0x',
				to,
				value
			};

			const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });

			const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
			const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

			await this.safeService.proposeTransaction({
				safeAddress: multisigAddress,
				safeTransactionData: safeTransaction.data,
				safeTxHash,
				senderAddress,
				senderSignature: senderSignature.data
			});

			return safeTxHash;
		} catch (err) {
			console.log('error from createSafeTx', err);
			return null;
		}
	};

	getPendingTx = async (multisigAddress: string): Promise<SafeMultisigTransactionResponse[] | null> => {
		try {
			return (await this.safeService.getPendingTransactions(multisigAddress)).results;
		} catch (err) {
			console.log('error from getPendingTx', err);
			return null;
		}
	};

	getAllCompletedTx = async (multisigAddress: string): Promise<AllTransactionsListResponse | null> => {
		try {
			return (await this.safeService.getAllTransactions(multisigAddress, { executed: true, trusted: true }));
		} catch (err) {
			console.log('error from getAllCompletedTx', err);
			return null;
		}
	};

	signAndConfirmTx = async (txHash: string, multisig: string): Promise<SignatureResponse | null> => {
		try {
			const signer = await this.ethAdapter.getSignerAddress();
			const safeSdk = await Safe.create({ ethAdapter: this.ethAdapter, isL1SafeMasterCopy: true, safeAddress: multisig });
			const safeTransaction = await this.safeService.getTransaction(txHash);
			let signature = await safeSdk.signTransaction(safeTransaction) as any;
			signature = Object.fromEntries(signature.signatures.entries());
			console.log('signature', signature);
			return await this.safeService.confirmTransaction(txHash, signature[signer.toLowerCase()].data);
		} catch (err) {
			console.log('error from signAndConfirmTx', err);
			return null;
		}
	};

	executeTx = async (txHash: string, multisig: string): Promise<TransactionResult | undefined> => {
		try {
			console.log('execute receipt', 'running', txHash, multisig);
			const safeSdk = await Safe.create({ ethAdapter: this.ethAdapter, isL1SafeMasterCopy: true, safeAddress: multisig });
			const safeTransaction = await this.safeService.getTransaction(txHash);
			console.log('execute receipt', 'running 1', safeTransaction);
			const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
			console.log('execute receipt executeTxResponse', executeTxResponse);
			const res = await executeTxResponse.transactionResponse?.wait();

			console.log('execute receipt executeTxResponse res', res);
			return executeTxResponse;
		} catch (err) {
			console.log('error from executeTx', err);
			return undefined;
		}
	};

	getMultisigData = async (multisigAddress: string): Promise<SafeInfoResponse | null> => {
		try {
			const info = await this.safeService.getSafeInfo(multisigAddress);
			return info;
		} catch (err) {
			console.log('error from getMultisigData', err);
			return null;
		}
	};
}