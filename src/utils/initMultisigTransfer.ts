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

import { addNewTransaction } from './addNewTransaction';

interface Args {
	api: ApiPromise,
	recipientAddress: string,
	initiatorAddress: string,
	multisig: IMultisigAddress,
	amount: BN,
	network: string
}

export default async function initMultisigTransfer({
	api,
	recipientAddress,
	initiatorAddress,
	multisig,
	amount,
	network
}: Args) {

	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// 2. Define relevant constants
	const MAX_WEIGHT = new Uint8Array([640000000]);
	const AMOUNT_TO_SEND = amount.toNumber();
	const displayAmount = formatBalance(AMOUNT_TO_SEND);

	// remove initator address from signatories
	const otherSignatories =  multisig.signatories.sort().filter((signatory) => signatory !== initiatorAddress);

	// 3. API calls - info is necessary for the timepoint
	const call = api.tx.balances.transfer(recipientAddress, AMOUNT_TO_SEND);

	// 4. Set the timepoint
	// null for transaction initiation
	const TIME_POINT = null;

	let blockHash = '';
	// 5. first call is approveAsMulti
	await api.tx.multisig
		.approveAsMulti(multisig.threshold, otherSignatories, TIME_POINT, call.method.hash, MAX_WEIGHT)
		.signAndSend(initiatorAddress, async ({ status, txHash, events }) => {
			// TODO: Make callback function reusable (pass onSuccess and onError functions)
			if (status.isInvalid) {
				console.log('Transaction invalid');
			} else if (status.isReady) {
				console.log('Transaction is ready');
			} else if (status.isBroadcast) {
				console.log('Transaction has been broadcasted');
			} else if (status.isInBlock) {
				blockHash = status.asInBlock.toHex();
				console.log('Transaction is in block');
			} else if (status.isFinalized) {
				console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
				console.log(`approveAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

				const block = await api.rpc.chain.getBlock(blockHash);
				const blockNumber = block.block.header.number.toNumber();

				events.forEach(({ event }) => {
					if (event.method === 'ExtrinsicSuccess') {
						queueNotification({
							header: 'Success!',
							message: 'Transaction Successful.',
							status: NotificationStatus.SUCCESS
						});
						// 6. store data to BE
						// created_at should be set by BE for server time, amount_usd should be fetched by BE
						addNewTransaction({
							amount,
							block_number: blockNumber,
							callData: call.method.toHex(),
							callHash: call.hash.toHex(),
							from: multisig.address,
							network,
							to: recipientAddress
						});
					} else if (event.method === 'ExtrinsicFailed') {
						console.log('Transaction failed');
						queueNotification({
							header: 'Error!',
							message: 'Transaction Failed',
							status: NotificationStatus.ERROR
						});
					}
				}
				);
			}
		}).catch((error) => {
			console.log(':( transaction failed');
			console.error('ERROR:', error);
			queueNotification({
				header: 'Failed!',
				message: error.message,
				status: NotificationStatus.ERROR
			});
		});

	console.log(`Sending ${displayAmount} from multisig: ${multisig.address} to ${recipientAddress}, initiated by ${initiatorAddress}`);
	console.log(`Submitted values : approveAsMulti(${multisig.threshold},
		otherSignatories: ${JSON.stringify(otherSignatories)},
		${TIME_POINT},
		${call.method.hash},
		${MAX_WEIGHT})\n`
	);
}