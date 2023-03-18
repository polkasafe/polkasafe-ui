// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import { MessageInstance } from 'antd/es/message/interface';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import { IMultisigAddress } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

import { calcWeight } from './calcWeight';
import { getMultisigInfo } from './getMultisigInfo';
import sendNotificationToAddresses from './sendNotificationToAddresses';
import updateTransactionNote from './updateTransactionNote';

interface Args {
	api: ApiPromise,
	network: string,
	multisig: IMultisigAddress,
	callDataHex?: string,
	callHash: string,
	amount?: BN,
	approvingAddress: string,
	recipientAddress?: string,
	note: string,
	messageApi: MessageInstance
}

export async function approveMultisigTransfer ({ amount, api, approvingAddress, callDataHex, callHash, recipientAddress, messageApi, multisig, network, note }: Args) {
	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// 2. Set relevant vars
	const ZERO_WEIGHT = new Uint8Array(0);
	let WEIGHT: any = ZERO_WEIGHT;
	let call: any;
	let AMOUNT_TO_SEND: number;
	let displayAmount: string;

	// remove approving address address from signatories
	const otherSignatories = multisig.signatories.sort().filter((signatory) => signatory !== approvingAddress);

	if(callDataHex && amount && recipientAddress) {
		AMOUNT_TO_SEND = amount.toNumber();
		displayAmount = formatBalance(AMOUNT_TO_SEND);

		const callData = api.createType('Call', callDataHex);
		const { weight } = await calcWeight(callData, api);
		WEIGHT = weight;

		// invalid call data for this call hash
		if (!callData.hash.eq(callHash)) return;

		// 3. tx call
		call = api.tx.balances.transferKeepAlive(recipientAddress, AMOUNT_TO_SEND);
	}

	const multisigInfos = await getMultisigInfo(multisig.address, api);
	const [, multisigInfo] = multisigInfos?.find(([h]) => h.eq(callHash)) || [null, null];

	if(!multisigInfo) {
		console.log('No multisig info found');
		return;
	}

	console.log(`Time point is: ${multisigInfo?.when}`);

	const numApprovals = multisigInfo.approvals.length;

	return new Promise<void>((resolve, reject) => {

		// 5. Send asMulti if last approval call
		if (numApprovals < multisig.threshold - 1) {
			api.tx.multisig
				.approveAsMulti(multisig.threshold, otherSignatories, multisigInfo.when, callHash, ZERO_WEIGHT)
				.signAndSend(approvingAddress, async ({ status, txHash, events }) => {
					if (status.isInvalid) {
						console.log('Transaction invalid');
						messageApi.error('Transaction invalid');
					} else if (status.isReady) {
						console.log('Transaction is ready');
						messageApi.loading('Transaction is ready');
					} else if (status.isBroadcast) {
						console.log('Transaction has been broadcasted');
						messageApi.loading('Transaction has been broadcasted');
					} else if (status.isInBlock) {
						console.log('Transaction is in block');
						messageApi.loading('Transaction is in block');
					} else if (status.isFinalized) {
						console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
						console.log(`approveAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

						for (const { event } of events) {
							if (event.method === 'ExtrinsicSuccess') {
								queueNotification({
									header: 'Success!',
									message: 'Transaction Successful.',
									status: NotificationStatus.SUCCESS
								});
								resolve();
							} else if (event.method === 'ExtrinsicFailed') {
								console.log('Transaction failed');
								queueNotification({
									header: 'Error!',
									message: 'Transaction Failed',
									status: NotificationStatus.ERROR
								});
								reject('ExtrinsicFailed');
							}
						}
					}
				}).catch((error) => {
					console.log(error);
					reject(error);
				});
		} else {
			api.tx.multisig
				.asMulti(multisig.threshold, otherSignatories, multisigInfo.when, call.method.toHex(), WEIGHT as any)
				.signAndSend(approvingAddress, async ({ status, txHash, events }) => {
					if (status.isInvalid) {
						console.log('Transaction invalid');
						messageApi.error('Transaction invalid');
					} else if (status.isReady) {
						console.log('Transaction is ready');
						messageApi.loading('Transaction is ready');
					} else if (status.isBroadcast) {
						console.log('Transaction has been broadcasted');
						messageApi.loading('Transaction has been broadcasted');
					} else if (status.isInBlock) {
						console.log('Transaction is in block');
						messageApi.loading('Transaction is in block');
					} else if (status.isFinalized) {
						console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
						console.log(`asMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

						for (const { event } of events) {
							if (event.method === 'ExtrinsicSuccess') {
								queueNotification({
									header: 'Success!',
									message: 'Transaction Successful.',
									status: NotificationStatus.SUCCESS
								});

								resolve();

								// update note for transaction history
								updateTransactionNote({ callHash: txHash.toHex(), multisigAddress: multisig.address, network, note });

								sendNotificationToAddresses({
									addresses: otherSignatories,
									link: `/transactions?tab=History#${txHash.toHex()}`,
									message: 'Transaction Executed!',
									network,
									type: 'sent'
								});
							} else if (event.method === 'ExtrinsicFailed') {
								console.log('Transaction failed');
								queueNotification({
									header: 'Error!',
									message: 'Transaction Failed',
									status: NotificationStatus.ERROR
								});
								reject('ExtrinsicFailed');
							}
						}
					}
				}).catch((error) => {
					console.log(error);
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
					reject(error);
				});
		}

		console.log(`Sending ${displayAmount} from ${multisig.address} to ${recipientAddress}`);
		console.log(`Submitted values: asMulti(${multisig.threshold}, otherSignatories: ${JSON.stringify(otherSignatories, null, 2)}, ${multisigInfo?.when}, ${call.method.hash}, ${WEIGHT})\n`);
	});
}
