// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import { sortAddresses } from '@polkadot/util-crypto';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import { NotificationStatus } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';

import { addNewTransaction } from './addNewTransaction';
import { calcWeight } from './calcWeight';
import { IMultiTransferResponse } from './initMultisigTransfer';
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
	setTxnHash: React.Dispatch<React.SetStateAction<string>>
}

export async function transferAndProxyBatchAll({ api, setTxnHash, network, recepientAddress, senderAddress, amount, setLoadingMessages, signatories, threshold } : Props) {

	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	const AMOUNT_TO_SEND = amount.toNumber();
	const displayAmount = formatBalance(AMOUNT_TO_SEND); // 2.0000 WND

	const otherSignatories = sortAddresses(signatories.filter((sig) => sig !== senderAddress));
	const proxyTx = api.tx.proxy.createPure('Any', 0, new Date().getMilliseconds());
	const transferTx = api.tx.balances.transferKeepAlive(recepientAddress, AMOUNT_TO_SEND);

	const callData = api.createType('Call', transferTx.method.toHex());
	const { weight: MAX_WEIGHT } = await calcWeight(callData, api);

	const multiSigProxyCall = api.tx.multisig.asMulti(threshold, otherSignatories, null, proxyTx, MAX_WEIGHT as any);
	// Some funds are needed on the multisig for the pure proxy creation

	let blockHash = '';

	return new Promise<IMultiTransferResponse>((resolve, reject) => {

		api.tx.utility
			.batchAll([transferTx, multiSigProxyCall])
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
							setTxnHash(proxyTx.method.hash.toHex());
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

							const reservedProxyDeposit = (api.consts.proxy.proxyDepositFactor as unknown as BN)
								.muln(1)
								.iadd(api.consts.proxy.proxyDepositBase as unknown as BN);

							// store data to BE
							// created_at should be set by BE for server time, amount_usd should be fetched by BE
							addNewTransaction({
								amount: reservedProxyDeposit,
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
		console.log(`Sending ${displayAmount} from ${senderAddress} to ${recepientAddress}`);
	});
}
