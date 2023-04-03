// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import { MessageInstance } from 'antd/es/message/interface';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';

interface Props {
	recepientAddress: string;
	senderAddress: string;
	amount: BN;
	api: ApiPromise;
	network: string;
	messageApi: MessageInstance
}

export async function transferFunds({ api, network, recepientAddress, senderAddress, amount, messageApi } : Props) {

	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	const AMOUNT_TO_SEND = amount.toNumber();
	const displayAmount = formatBalance(AMOUNT_TO_SEND); // 2.0000 WND

	return new Promise<void>((resolve, reject) => {

		api.tx.balances
			.transferKeepAlive(recepientAddress, AMOUNT_TO_SEND)
			.signAndSend(senderAddress, async ({ status, txHash, events }) => {
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
					console.log(`transfer tx: https://${network}.subscan.io/extrinsic/${txHash}`);

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
			});
		console.log(`Sending ${displayAmount} from ${senderAddress} to ${recepientAddress}`);
	});
}
