// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

import { addNewTransaction } from './addNewTransaction';
import getEncodedAddress from './getEncodedAddress';
import { IMultiTransferResponse } from './initMultisigTransfer';
import { notify } from './notify';
import sendNotificationToAddresses from './sendNotificationToAddresses';

interface Props {
	recepientAddress: string;
	senderAddress: string;
	amount: BN;
	api: ApiPromise;
	network: string;
	setLoadingMessages: React.Dispatch<React.SetStateAction<string>>;
    signatories: string[];
    threshold: number;
	setTxnHash: React.Dispatch<React.SetStateAction<string>>;
	multisigAddress: string
}

export async function transferAndProxyBatchAll({ api, multisigAddress, setTxnHash, network, recepientAddress, senderAddress, amount, setLoadingMessages, signatories, threshold } : Props) {

	const encodedInitiatorAddress = getEncodedAddress(senderAddress, network) || senderAddress;

	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	const AMOUNT_TO_SEND = amount.toString();
	const displayAmount = formatBalance(AMOUNT_TO_SEND); // 2.0000 WND

	// remove approving address address from signatories
	const encodedSignatories =  signatories.sort().map((signatory) => {
		const encodedSignatory = getEncodedAddress(signatory, network);
		if(!encodedSignatory) throw new Error('Invalid signatory address');
		return encodedSignatory;
	});

	const otherSignatories = encodedSignatories.filter((signatory) => signatory !== encodedInitiatorAddress);
	const proxyTx = api.tx.proxy.createPure('Any', 0, new Date().getMilliseconds());
	const transferTxn = api.tx.balances.transferKeepAlive(recepientAddress, AMOUNT_TO_SEND);

	const ZERO_WEIGHT = new Uint8Array(0);
	const multisigProxyTxn = api.tx.multisig.asMulti(threshold, otherSignatories, null, proxyTx, ZERO_WEIGHT);

	let blockHash = '';

	const batchTxn = amount.isZero() ? api.tx.utility.batchAll([multisigProxyTxn]) : api.tx.utility.batchAll([transferTxn, multisigProxyTxn]);

	return new Promise<IMultiTransferResponse>((resolve, reject) => {

		batchTxn
			.signAndSend(encodedInitiatorAddress, async ({ status, txHash, events }) => {
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
							setTxnHash(proxyTx.method.hash.toHex());

							notify({
								args: {
									address: senderAddress,
									addresses: otherSignatories,
									callHash: proxyTx.method.hash.toHex(),
									multisigAddress,
									network
								},
								network,
								triggerName: 'createdProxy'
							});

							queueNotification({
								header: 'Success!',
								message: 'Transaction Successful.',
								status: NotificationStatus.SUCCESS
							});
							resolve({
								callData: proxyTx.method.toHex(),
								callHash: proxyTx.method.hash.toHex(),
								created_at: new Date()
							});

							// store data to BE
							// created_at should be set by BE for server time, amount_usd should be fetched by BE
							addNewTransaction({
								amount: amount,
								block_number: blockNumber,
								callData: proxyTx.method.toHex(),
								callHash: proxyTx.method.hash.toHex(),
								from: senderAddress,
								network,
								note: 'Creating a New Proxy.',
								to: recepientAddress
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

		if(!amount.isZero()){
			console.log(`Sending ${displayAmount} from ${encodedInitiatorAddress} to ${recepientAddress}`);
		}
	});
}
