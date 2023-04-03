// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import { chainProperties } from 'src/global/networkConstants';
import { IMultisigAddress } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

import sendNotificationToAddresses from './sendNotificationToAddresses';

interface Props {
	api: ApiPromise,
	network: string,
	multisig: IMultisigAddress,
	approvingAddress: string,
	recipientAddress?: string,
	callHash: string,
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>
}

export async function cancelMultisigTransfer ({ api, approvingAddress, callHash, recipientAddress, multisig, network, setLoadingMessages }: Props) {
	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// remove approving address address from signatories
	const otherSignatories = multisig.signatories.sort().filter((signatory) => signatory !== approvingAddress);

	// 3. Retrieve and unwrap the timepoint
	const info = await api.query.multisig.multisigs(multisig.address, callHash);
	const TIME_POINT= info.unwrap().when;
	console.log(`Time point is: ${TIME_POINT}`);

	const numApprovals = info.unwrap().approvals.length;

	return new Promise<void>((resolve, reject) => {
		// 4. Send cancelAsMulti if last approval call
		if (numApprovals < multisig.threshold - 1) {
		// cannot cancel if not last approval
			return;
		} else {
			api.tx.multisig
				.cancelAsMulti(multisig.threshold, otherSignatories, TIME_POINT, callHash)
				.signAndSend(approvingAddress, async ({ status, txHash, events }) => {
					if (status.isInvalid) {
						console.log('Transaction invalid');
						setLoadingMessages('Transaction invalid');
					} else if (status.isReady) {
						console.log('Transaction is ready');
						setLoadingMessages('Transaction is ready');
					} else if (status.isBroadcast) {
						console.log('Transaction has been broadcasted');
						setLoadingMessages('Transaction has been broadcasted');
					} else if (status.isInBlock) {
						console.log('Transaction is in block');
						setLoadingMessages('Transaction is in block');
					} else if (status.isFinalized) {
						console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
						console.log(`cancelAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);

						for (const { event } of events) {
							if (event.method === 'ExtrinsicSuccess') {
								queueNotification({
									header: 'Success!',
									message: 'Transaction Successful.',
									status: NotificationStatus.SUCCESS
								});

								await sendNotificationToAddresses({
									addresses: otherSignatories,
									link: '',
									message: 'Transaction cancelled.',
									network,
									type: 'cancelled'
								});
								resolve();
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
					console.log(error);
					reject(error);
					queueNotification({
						header: 'Failed!',
						message: error.message,
						status: NotificationStatus.ERROR
					});
				});
		}

		console.log(`Cancel tx from ${multisig.address} ${recipientAddress ? `to ${recipientAddress}` : ''}`);
		console.log(`Submitted values: cancelAsMulti(${multisig.threshold}, otherSignatories: ${JSON.stringify(otherSignatories, null, 2)}, ${TIME_POINT}, ${callHash})\n`);
	});
}
