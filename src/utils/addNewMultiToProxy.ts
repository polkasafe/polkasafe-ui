// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

import _createMultisig from './_createMultisig';
import { addNewTransaction } from './addNewTransaction';
import { calcWeight } from './calcWeight';
import getEncodedAddress from './getEncodedAddress';
import { IMultiTransferResponse } from './initMultisigTransfer';
import { notify } from './notify';
import sendNotificationToAddresses from './sendNotificationToAddresses';

interface Props {
	recepientAddress: string;
	senderAddress: string;
	api: ApiPromise;
	network: string;
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>;
	oldSignatories: string[];
	oldThreshold: number;
	newSignatories: string[];
	newThreshold: number;
	proxyAddress: string;
	setTxnHash?: React.Dispatch<React.SetStateAction<string>>
	oldMultisigAddress: string;
}

export async function addNewMultiToProxy({ proxyAddress, oldMultisigAddress, setTxnHash, api, network, recepientAddress, senderAddress, setLoadingMessages, oldSignatories, oldThreshold, newSignatories, newThreshold }: Props) {

	formatBalance.setDefaults({
		decimals: chainProperties[network].decimals,
		unit: chainProperties[network].ticker
	});

	const encodedSignatories = oldSignatories.sort().map((signatory) => {
		const encodedSignatory = getEncodedAddress(signatory, network);
		if (!encodedSignatory) throw new Error('Invalid signatory address');
		return encodedSignatory;
	});

	const otherSignatories = encodedSignatories.filter((sig) => sig !== senderAddress);
	const multisigResponse = _createMultisig(newSignatories, newThreshold, chainProperties[network].decimals);
	const newMultisigAddress = getEncodedAddress(multisigResponse?.multisigAddress || '', network);
	const addProxyTx = api.tx.proxy.addProxy(newMultisigAddress || '', 'Any', 0);
	const proxyTx = api.tx.proxy.proxy(proxyAddress, null, addProxyTx);

	const callData = api.createType('Call', proxyTx.method.toHex());
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);

	let blockHash = '';

	return new Promise<IMultiTransferResponse>((resolve, reject) => {

		api.tx.multisig
			.asMulti(oldThreshold, otherSignatories, null, proxyTx, MAX_WEIGHT as any)
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
					blockHash = status.asInBlock.toHex();
					console.log('Transaction is in block');
					setLoadingMessages('Transaction is in block');
				} else if (status.isFinalized) {
					console.log(`Transaction has been included in blockHash ${status.asFinalized.toHex()}`);
					console.log(`transfer tx: https://${network}.subscan.io/extrinsic/${txHash}`);

					const block = await api.rpc.chain.getBlock(blockHash);
					const blockNumber = block.block.header.number.toNumber();

					for (const { event } of events) {
						if (event.method === 'ExtrinsicSuccess') {
							queueNotification({
								header: 'Success!',
								message: 'Transaction Successful.',
								status: NotificationStatus.SUCCESS
							});

							notify({
								args: {
									address: senderAddress,
									addresses: otherSignatories,
									callHash: proxyTx.method.hash.toHex(),
									multisigAddress: oldMultisigAddress,
									network
								},
								network,
								triggerName: 'editMultisigUsersStart'
							});

							resolve({
								callData: proxyTx.method.toHex(),
								callHash: proxyTx.method.hash.toHex(),
								created_at: new Date()
							});

							// store data to BE
							// created_at should be set by BE for server time, amount_usd should be fetched by BE
							addNewTransaction({
								amount: new BN(0),
								block_number: blockNumber,
								callData: proxyTx.method.toHex(),
								callHash: proxyTx.method.hash.toHex(),
								from: senderAddress,
								network,
								note: 'Adding New Signatories to Multisig',
								to: recepientAddress
							});

							setTxnHash?.(proxyTx.method.hash.toHex());

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
							if (!errorModule) {
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
