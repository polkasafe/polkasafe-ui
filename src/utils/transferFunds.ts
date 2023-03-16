// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';

interface Props {
	recepientAddress: string;
	senderAddress: string;
	amount: BN;
	api: ApiPromise;
	network: string
}

export async function transferFunds({ api, network, recepientAddress, senderAddress, amount } : Props) {

	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	const AMOUNT_TO_SEND = amount.toNumber();
	const displayAmount = formatBalance(AMOUNT_TO_SEND); // 2.0000 WND

	const txHash = await api.tx.balances
		.transfer(recepientAddress, AMOUNT_TO_SEND)
		.signAndSend(senderAddress);
	console.log(`Sending ${displayAmount} from ${senderAddress} to ${recepientAddress}`);
	console.log(`transfer tx: https://${network}.subscan.io/extrinsic/${txHash}`);
}
