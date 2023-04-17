// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import { sortAddresses } from '@polkadot/util-crypto';
import { chainProperties } from 'src/global/networkConstants';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

import { calcWeight } from './calcWeight';
import { IMultiTransferResponse } from './initMultisigTransfer';
import sendNotificationToAddresses from './sendNotificationToAddresses';

interface Props {
	recepientAddress: string;
	senderAddress: string;
	api: ApiPromise;
	network: string;
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>;
    newSignatories: string[];
    newThreshold: number;
    proxyAddress: string;
    multisigAddress: string;
}

export async function removeOldMultiFromProxy({ multisigAddress, proxyAddress, api, network, senderAddress, setLoadingMessages, newSignatories, newThreshold } : Props) {

	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	const otherSignatories = sortAddresses(newSignatories.filter((sig) => sig !== senderAddress));
	const removeProxyTx = api.tx.proxy.removeProxy(multisigAddress, 'Any', 0);
	const proxyTx = api.tx.proxy.proxy(proxyAddress, null, removeProxyTx);

	const callData = api.createType('Call', proxyTx.method.toHex());
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);

	return new Promise<IMultiTransferResponse>((resolve, reject) => {

		api.tx.multisig
			.asMulti(newThreshold, otherSignatories, null, proxyTx, MAX_WEIGHT as any)
			.signAndSend(senderAddress, async ({ status, txHash, events }) => {
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
					console.log(`transfer tx: https://${network}.subscan.io/extrinsic/${txHash}`);

					for (const { event } of events) {
						if (event.method === 'ExtrinsicSuccess') {
							queueNotification({
								header: 'Success!',
								message: 'Transaction Successful.',
								status: NotificationStatus.SUCCESS
							});
							console.log('proxyTx', proxyTx.method.hash.toHex());
							resolve({
								callData: proxyTx.method.toHex(),
								callHash: proxyTx.method.hash.toHex(),
								created_at: new Date()
							});

							sendNotificationToAddresses({
								addresses: otherSignatories,
								link: `/transactions?tab=Queue#${proxyTx.method.hash.toHex()}`,
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
	});
}
