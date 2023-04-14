// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { formatBalance } from '@polkadot/util/format';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import { IMultisigAddress } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

import { addNewTransaction } from './addNewTransaction';
import { calcWeight } from './calcWeight';
import sendNotificationToAddresses from './sendNotificationToAddresses';

export interface IMultiTransferResponse {
	callData: string;
	callHash: string;
	created_at: Date;
}

interface Args {
	api: ApiPromise,
	recipientAddress: string,
	initiatorAddress: string,
	multisig: IMultisigAddress,
	amount: BN,
	network: string,
	note: string,
	transferKeepAlive: boolean,
	isProxy?: boolean,
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>
}

export default async function initMultisigTransfer({
	api,
	recipientAddress,
	initiatorAddress,
	multisig,
	amount,
	isProxy,
	network,
	note,
	transferKeepAlive,
	setLoadingMessages
}: Args) {

	//promise to be resolved when transaction is finalized

	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// 2. Define relevant constants
	// const MAX_WEIGHT = new Uint8Array([640000000]);
	const AMOUNT_TO_SEND = amount.toNumber();
	const displayAmount = formatBalance(AMOUNT_TO_SEND);

	// remove initator address from signatories
	const otherSignatories =  multisig.signatories.sort().filter((signatory) => signatory !== initiatorAddress);

	// 3. API calls - info is necessary for the timepoint
	const call = transferKeepAlive ? api.tx.balances.transferKeepAlive(recipientAddress, AMOUNT_TO_SEND) : api.tx.balances.transfer(recipientAddress, AMOUNT_TO_SEND);

	let tx: SubmittableExtrinsic<'promise'>;
	if(isProxy && multisig.proxy){
		tx = api.tx.proxy.proxy(multisig.proxy, null, call);
	}

	// 4. Set the timepoint
	// null for transaction initiation
	const TIME_POINT = null;

	const callData = api.createType('Call', call.method.toHex());
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);

	let blockHash = '';

	return new Promise<IMultiTransferResponse>((resolve, reject) => {

		// 5. for transaction from proxy address
		if(isProxy && multisig.proxy){
			api.tx.multisig
				.asMulti(multisig.threshold, otherSignatories, TIME_POINT, tx, MAX_WEIGHT as any)
				.signAndSend(initiatorAddress, async ({ status, txHash, events }) => {
					if (status.isInvalid) {
						console.log('Transaction invalid');
						// messageApi.error('Transaction invalid');
						setLoadingMessages('Transaction invalid');
					} else if (status.isReady) {
						console.log('Transaction is ready');
						// messageApi.loading('Transaction is ready');
						setLoadingMessages('Transaction is ready');
					} else if (status.isBroadcast) {
						console.log('Transaction has been broadcasted');
						// messageApi.loading('Transaction has been broadcasted');
						setLoadingMessages('Transaction has been broadcasted');
					} else if (status.isInBlock) {
						blockHash = status.asInBlock.toHex();
						console.log('Transaction is in block');
						// messageApi.loading('Transaction is in block');
						setLoadingMessages('Transaction is in block');
					} else if (status.isFinalized) {
						console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
						console.log(`approveAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

						const block = await api.rpc.chain.getBlock(blockHash);
						const blockNumber = block.block.header.number.toNumber();

						for (const { event } of events) {
							if (event.method === 'ExtrinsicSuccess') {
								queueNotification({
									header: 'Success!',
									message: 'Transaction Successful.',
									status: NotificationStatus.SUCCESS
								});

								resolve({
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
									created_at: new Date()
								});

								// 6. store data to BE
								// created_at should be set by BE for server time, amount_usd should be fetched by BE
								console.log('callhash: ', tx.method.hash.toHex());
								addNewTransaction({
									amount,
									block_number: blockNumber,
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
									from: multisig.proxy!,
									network,
									note,
									to: recipientAddress
								});

								sendNotificationToAddresses({
									addresses: otherSignatories,
									link: `/transactions?tab=Queue#${tx.method.hash.toHex()}`,
									message: 'New transaction to sign',
									network,
									type: 'sent'
								});
							} else if (event.method === 'ExtrinsicFailed') {
								console.log('Transaction failed');

								const errorModule = (event.data as any)?.dispatchError?.asModule;
								if(!errorModule) {
									queueNotification({
										header: 'Error!',
										message: 'Transaction Failed',
										status: NotificationStatus.ERROR
									});
									reject('Transaction Failed');
									return;
								}

								const { method, section, docs } = api.registry.findMetaError(errorModule);
								console.log(`Error: ${section}.${method}\n${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								reject(`Error: ${section}.${method}\n${docs.join(' ')}`);
							}
						}
					}
				}).catch((error) => {
					console.log(':( transaction failed');
					console.error('ERROR:', error);
					reject();
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				});
			console.log(`Sending ${displayAmount} from multisig: ${multisig.proxy} to ${recipientAddress}, initiated by ${initiatorAddress}`);
		}
		else{
			//for transaction from multisig address
			api.tx.multisig
				.approveAsMulti(multisig.threshold, otherSignatories, TIME_POINT, call.method.hash, MAX_WEIGHT as any)
				.signAndSend(initiatorAddress, async ({ status, txHash, events }) => {
					if (status.isInvalid) {
						console.log('Transaction invalid');
						// messageApi.error('Transaction invalid');
						setLoadingMessages('Transaction invalid');
					} else if (status.isReady) {
						console.log('Transaction is ready');
						// messageApi.loading('Transaction is ready');
						setLoadingMessages('Transaction is ready');
					} else if (status.isBroadcast) {
						console.log('Transaction has been broadcasted');
						// messageApi.loading('Transaction has been broadcasted');
						setLoadingMessages('Transaction has been broadcasted');
					} else if (status.isInBlock) {
						blockHash = status.asInBlock.toHex();
						console.log('Transaction is in block');
						// messageApi.loading('Transaction is in block');
						setLoadingMessages('Transaction is in block');
					} else if (status.isFinalized) {
						console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
						console.log(`approveAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

						const block = await api.rpc.chain.getBlock(blockHash);
						const blockNumber = block.block.header.number.toNumber();

						for (const { event } of events) {
							if (event.method === 'ExtrinsicSuccess') {
								queueNotification({
									header: 'Success!',
									message: 'Transaction Successful.',
									status: NotificationStatus.SUCCESS
								});

								resolve({
									callData: call.method.toHex(),
									callHash: call.method.hash.toHex(),
									created_at: new Date()
								});

								// 6. store data to BE
								// created_at should be set by BE for server time, amount_usd should be fetched by BE
								addNewTransaction({
									amount,
									block_number: blockNumber,
									callData: call.method.toHex(),
									callHash: call.method.hash.toHex(),
									from: multisig.address,
									network,
									note,
									to: recipientAddress
								});

								sendNotificationToAddresses({
									addresses: otherSignatories,
									link: `/transactions?tab=Queue#${call.method.hash.toHex()}`,
									message: 'New transaction to sign',
									network,
									type: 'sent'
								});
							} else if (event.method === 'ExtrinsicFailed') {
								console.log('Transaction failed');

								const errorModule = (event.data as any)?.dispatchError?.asModule;
								if(!errorModule) {
									queueNotification({
										header: 'Error!',
										message: 'Transaction Failed',
										status: NotificationStatus.ERROR
									});
									reject('Transaction Failed');
									return;
								}

								const { method, section, docs } = api.registry.findMetaError(errorModule);
								console.log(`Error: ${section}.${method}\n${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								reject(`Error: ${section}.${method}\n${docs.join(' ')}`);
							}
						}
					}
				}).catch((error) => {
					console.log(':( transaction failed');
					console.error('ERROR:', error);
					reject();
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				});
			console.log(`Sending ${displayAmount} from multisig: ${multisig.address} to ${recipientAddress}, initiated by ${initiatorAddress}`);
		}
		console.log(`Submitted values : approveAsMulti(${multisig.threshold},
		otherSignatories: ${JSON.stringify(otherSignatories)},
		${TIME_POINT},
		${call.method.hash},
		${MAX_WEIGHT})\n`
		);
	});
}