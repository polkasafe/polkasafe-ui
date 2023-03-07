// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import { IMultisigAddress } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

interface Props {
	api: ApiPromise,
	network: string,
	multisig: IMultisigAddress,
	amount: BN,
	approvingAddress: string,
	recipientAddress: string,
}

export async function approveMultisigTransfer ({ amount, api, approvingAddress, recipientAddress, multisig, network }: Props) {
	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// 2. Set relevant constants
	const MAX_WEIGHT = new Uint8Array(640000000);
	const AMOUNT_TO_SEND = amount.toNumber();
	const displayAmount = formatBalance(AMOUNT_TO_SEND);

	// remove approving address address from signatories
	const otherSignatories = multisig.signatories.sort().filter((signatory) => signatory !== approvingAddress);

	// 3. tx call
	const call = api.tx.balances.transfer(recipientAddress, AMOUNT_TO_SEND);

	// 4. Retrieve and unwrap the timepoint
	const info = await api.query.multisig.multisigs(multisig.address, call.method.hash);
	const TIME_POINT= info.unwrap().when;
	console.log(`Time point is: ${TIME_POINT}`);

	const numApprovals = info.unwrap().approvals.length;

	// 5. Send asMulti if last approval call
	if (numApprovals < multisig.threshold - 1) {
		await api.tx.multisig
			.approveAsMulti(multisig.threshold, otherSignatories, TIME_POINT, call.method.toHex(), MAX_WEIGHT)
			.signAndSend(approvingAddress, async ({ status, txHash, events }) => {
				// TODO: Make callback function reusable (pass onSuccess and onError functions)
				if (status.isInvalid) {
					console.log('Transaction invalid');
				} else if (status.isReady) {
					console.log('Transaction is ready');
				} else if (status.isBroadcast) {
					console.log('Transaction has been broadcasted');
				} else if (status.isInBlock) {
					console.log('Transaction is in block');
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
							// 6. store data to BE
							// created_at should be set by BE for server time, amount_usd should be fetched by BE
						} else if (event.method === 'ExtrinsicFailed') {
							console.log('Transaction failed');
							queueNotification({
								header: 'Error!',
								message: 'Transaction Failed',
								status: NotificationStatus.ERROR
							});
						}
					}
				}
			});
	} else {
		await api.tx.multisig
			.asMulti(multisig.threshold, otherSignatories, TIME_POINT, call.method.toHex(), MAX_WEIGHT)
			.signAndSend(approvingAddress, async ({ status, txHash, events }) => {
				// TODO: Make callback function reusable (pass onSuccess and onError functions)
				if (status.isInvalid) {
					console.log('Transaction invalid');
				} else if (status.isReady) {
					console.log('Transaction is ready');
				} else if (status.isBroadcast) {
					console.log('Transaction has been broadcasted');
				} else if (status.isInBlock) {
					console.log('Transaction is in block');
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
							// 6. store data to BE
							// created_at should be set by BE for server time, amount_usd should be fetched by BE
						} else if (event.method === 'ExtrinsicFailed') {
							console.log('Transaction failed');
							queueNotification({
								header: 'Error!',
								message: 'Transaction Failed',
								status: NotificationStatus.ERROR
							});
						}
					}
				}
			});
	}

	console.log(`Sending ${displayAmount} from ${multisig.address} to ${recipientAddress}`);
	console.log(`Submitted values: asMulti(${multisig.threshold}, otherSignatories: ${JSON.stringify(otherSignatories, null, 2)}, ${TIME_POINT}, ${call.method.hash}, ${MAX_WEIGHT})\n`);
}
