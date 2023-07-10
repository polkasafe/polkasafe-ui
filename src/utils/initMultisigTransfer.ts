// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { formatBalance } from '@polkadot/util/format';
import BN from 'bn.js';
import { ISubfieldAndAttachment } from 'src/components/SendFunds/SendFundsForm';
import { chainProperties } from 'src/global/networkConstants';
import { IMultisigAddress } from 'src/types';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

import { addAttachment } from './addAttachment';
import { addNewTransaction } from './addNewTransaction';
import { calcWeight } from './calcWeight';
import getEncodedAddress from './getEncodedAddress';
import { notify } from './notify';
import sendNotificationToAddresses from './sendNotificationToAddresses';

export interface IMultiTransferResponse {
	callData: string;
	callHash: string;
	created_at: Date;
}

export interface IRecipientAndAmount{
	recipient: string;
	amount: BN
}

interface Args {
	api: ApiPromise,
	recipientAndAmount: IRecipientAndAmount[],
	initiatorAddress: string,
	multisig: IMultisigAddress,
	network: string,
	note: string,
	transferKeepAlive: boolean,
	isProxy?: boolean,
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>,
	transactionFields?: {category: string, subfields: {[subfield: string]: { name: string, value: string }}}
	attachments?: ISubfieldAndAttachment,
	tip: BN
}

export default async function initMultisigTransfer({
	api,
	recipientAndAmount,
	initiatorAddress,
	multisig,
	isProxy,
	network,
	note,
	transferKeepAlive,
	setLoadingMessages,
	transactionFields,
	attachments,
	tip
}: Args) {
	const encodedInitiatorAddress = getEncodedAddress(initiatorAddress, network);
	if(!encodedInitiatorAddress) throw new Error('Invalid initiator address');

	//promise to be resolved when transaction is finalized

	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// 2. Define relevant constants
	// const MAX_WEIGHT = new Uint8Array([640000000]);
	const amounts = recipientAndAmount.map((o) => o.amount);
	const totalAmount = amounts.reduce((sum,item) => sum.add(item), new BN(0));
	const displayAmount = formatBalance(totalAmount);
	const recipientAddresses = recipientAndAmount.map((item) => getEncodedAddress(item.recipient, network) || item.recipient);

	const encodedSignatories = multisig.signatories.sort().map((signatory) => {
		const encodedSignatory = getEncodedAddress(signatory, network);
		if(!encodedSignatory) throw new Error('Invalid signatory address');
		return encodedSignatory;
	});

	// remove initator address from signatories
	const otherSignatories =  encodedSignatories.filter((signatory) => signatory !== encodedInitiatorAddress);

	// 3. API calls - info is necessary for the timepoint
	const transferCalls: any[] = [];
	for(const item of recipientAndAmount){
		const AMOUNT_TO_SEND = item.amount.toString();
		const call = transferKeepAlive ? api.tx.balances.transferKeepAlive(getEncodedAddress(item.recipient, network) || item.recipient, AMOUNT_TO_SEND) : api.tx.balances.transfer(getEncodedAddress(item.recipient, network) || item.recipient, AMOUNT_TO_SEND);
		transferCalls.push(call);
	}

	// 4. Set the timepoint
	// null for transaction initiation
	const TIME_POINT = null;

	const transferBatchCall = api.tx.utility.batch([...transferCalls]);

	const callData = api.createType('Call', transferBatchCall.method.toHex());
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);

	let tx: SubmittableExtrinsic<'promise'>;
	if(isProxy && multisig.proxy){
		tx = api.tx.proxy.proxy(multisig.proxy, null, transferBatchCall);
	}

	let blockHash = '';

	return new Promise<IMultiTransferResponse>((resolve, reject) => {

		// 5. for transaction from proxy address
		if(isProxy && multisig.proxy){
			api.tx.multisig
				.asMulti(multisig.threshold, otherSignatories, TIME_POINT, tx, 0 as any)
				.signAndSend(encodedInitiatorAddress, { tip }, async ({ status, txHash, events, dispatchError }) => {
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

						if (dispatchError) {
							if (dispatchError.isModule) {
							// for module errors, we have the section indexed, lookup
								const decoded = api.registry.findMetaError(dispatchError.asModule);
								const { docs, name, method, section } = decoded;

								console.log(`${section}.${name}: ${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								reject({
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
									created_at: new Date(),
									error: `Error: ${section}.${method}\n${docs.join(' ')}`
								});
							} else {
							// Other, CannotLookup, BadOrigin, no extra info
								console.log(dispatchError.toString());
							}
						}

						for (const { event } of events) {
							if (event.method === 'ExtrinsicSuccess') {
								queueNotification({
									header: 'Success!',
									message: 'Transaction Successful.',
									status: NotificationStatus.SUCCESS
								});

								notify({
									args: {
										address: initiatorAddress,
										addresses: otherSignatories,
										callHash: tx.method.hash.toHex(),
										multisigAddress: multisig.address,
										network
									},
									network,
									triggerName: 'initMultisigTransfer'
								});

								resolve({
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
									created_at: new Date()
								});

								// 6. store data to BE
								// created_at should be set by BE for server time, amount_usd should be fetched by BE
								addNewTransaction({
									amount: totalAmount,
									block_number: blockNumber,
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
									from: multisig.proxy!,
									network,
									note,
									to: recipientAddresses,
									transactionFields
								});

								if(attachments){
									for(const attachment of Object.keys(attachments)){
										await addAttachment({
											callHash: tx.method.hash.toHex(),
											file: attachments[attachment].file,
											network,
											subfield: attachment
										});
									}
								}

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
									reject({
										callData: tx.method.toHex(),
										callHash: tx.method.hash.toHex(),
										created_at: new Date(),
										error: 'Transaction Failed'
									});
									return;
								}

								const { method, section, docs } = api.registry.findMetaError(errorModule);
								console.log(`Error: ${section}.${method}\n${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								reject({
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
									created_at: new Date(),
									error: `Error: ${section}.${method}\n${docs.join(' ')}`
								});
							}
						}
					}
				}).catch((error) => {
					console.log(':( transaction failed');
					console.error('ERROR:', error);
					reject({
						callData: tx.method.toHex(),
						callHash: tx.method.hash.toHex(),
						created_at: new Date()
					});
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				});
			console.log(`Sending ${displayAmount} from multisig: ${multisig.proxy} to ${recipientAddresses}, initiated by ${encodedInitiatorAddress}`);
		}
		else{
		//for transaction from multisig address
			api.tx.multisig.approveAsMulti(multisig.threshold, otherSignatories, TIME_POINT, transferBatchCall.method.hash, MAX_WEIGHT as any)
				.signAndSend(encodedInitiatorAddress, { tip }, async ({ status, txHash, events, dispatchError }) => {
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

						if (dispatchError) {
							if (dispatchError.isModule) {
							// for module errors, we have the section indexed, lookup
								const decoded = api.registry.findMetaError(dispatchError.asModule);
								const { docs, name, method, section } = decoded;

								console.log(`${section}.${name}: ${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								reject({
									callData: tx.method.toHex(),
									callHash: tx.method.hash.toHex(),
									created_at: new Date(),
									error: `Error: ${section}.${method}\n${docs.join(' ')}`
								});
							} else {
							// Other, CannotLookup, BadOrigin, no extra info
								console.log(dispatchError.toString());
							}
						}

						for (const { event } of events) {
							if (event.method === 'ExtrinsicSuccess') {
								queueNotification({
									header: 'Success!',
									message: 'Transaction Successful.',
									status: NotificationStatus.SUCCESS
								});

								notify({
									args: {
										address: initiatorAddress,
										addresses: otherSignatories,
										callHash: txHash,
										multisigAddress: multisig.address,
										network
									},
									network,
									triggerName: 'initMultisigTransfer'
								});

								resolve({
									callData: transferBatchCall.method.toHex(),
									callHash: transferBatchCall.method.hash.toHex(),
									created_at: new Date()
								});

								// 6. store data to BE
								// created_at should be set by BE for server time, amount_usd should be fetched by BE
								addNewTransaction({
									amount: totalAmount,
									block_number: blockNumber,
									callData: transferBatchCall.method.toHex(),
									callHash: transferBatchCall.method.hash.toHex(),
									from: multisig.address,
									network,
									note,
									to: recipientAddresses,
									transactionFields
								});

								if(attachments){
									console.log('in');
									for(const attachment of Object.keys(attachments)){
										console.log('in for');
										const res = await addAttachment({
											callHash: transferBatchCall.method.hash.toHex(),
											file: attachments[attachment].file,
											network,
											subfield: attachment
										});
										console.log('res', res);
									}
								}

								sendNotificationToAddresses({
									addresses: otherSignatories,
									link: `/transactions?tab=Queue#${transferBatchCall.method.hash.toHex()}`,
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
									reject({
										callData: transferBatchCall.method.toHex(),
										callHash: transferBatchCall.method.hash.toHex(),
										created_at: new Date(),
										error: 'Transaction Failed'
									});
									return;
								}

								const { method, section, docs } = api.registry.findMetaError(errorModule);
								console.log(`Error: ${section}.${method}\n${docs.join(' ')}`);

								queueNotification({
									header: `Error! ${section}.${method}`,
									message: `${docs.join(' ')}`,
									status: NotificationStatus.ERROR
								});

								reject({
									callData: transferBatchCall.method.toHex(),
									callHash: transferBatchCall.method.hash.toHex(),
									created_at: new Date(),
									error: `Error: ${section}.${method}\n${docs.join(' ')}`
								});
							}
						}
					}
				}).catch((error) => {
					console.log(':( transaction failed');
					console.error('ERROR:', error);
					reject({
						callData: transferBatchCall.method.toHex(),
						callHash: transferBatchCall.method.hash.toHex(),
						created_at: new Date()
					});
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				});
			console.log(`Sending ${displayAmount} from multisig: ${multisig.address} to ${recipientAddresses}, initiated by ${encodedInitiatorAddress}`);
		// }
		// console.log(`Submitted values : approveAsMulti(${multisig.threshold},
		// otherSignatories: ${JSON.stringify(otherSignatories)},
		// ${TIME_POINT},
		// ${call.method.hash},
		// ${MAX_WEIGHT})\n`
		// );
		}});
}