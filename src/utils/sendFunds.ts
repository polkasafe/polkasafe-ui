// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { ApiPromise } from '@polkadot/api';
import { HttpProvider } from '@polkadot/rpc-provider';
import { formatBalance } from '@polkadot/util/format';

import { chainProperties } from '../global/networkConstants';

interface Args {
	recipientAddress: string,
	initiatorAddress: string,
	multisigAddress: string,
	signatories: string[],
	threshold: number,
	network: string
}

export default async function sendFundsFromMultisig({
	recipientAddress,
	initiatorAddress,
	multisigAddress,
	signatories,
	threshold,
	network
}: Args) {
	const httpProvider = new HttpProvider(chainProperties[network].rpcEndpoint);
	const api = await ApiPromise.create({ provider: httpProvider });

	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		unit: 'WND',
		decimals: 12
	});

	// 2. Define relevant constants
	const MAX_WEIGHT = '640000000';
	const AMOUNT_TO_SEND = 1000000000000;
	const displayAmount = formatBalance(AMOUNT_TO_SEND);

	signatories = signatories.sort();

	// remove initator address from signatories
	const otherSignatories = signatories.filter((signatory) => signatory !== initiatorAddress);

	// 3. API calls - info is necessary for the timepoint
	const call = api.tx.balances.transfer(recipientAddress, AMOUNT_TO_SEND);

	// 4. Set the timepoint
	// null for transaction initiation
	const TIME_POINT = null;

	// 5. approveAsMulti
	const txHash = await api.tx.multisig
		.approveAsMulti(threshold, otherSignatories, TIME_POINT, call.method.hash, MAX_WEIGHT)
		.signAndSend(initiatorAddress);

	console.log(`Sending ${displayAmount} from ${initiatorAddress} to ${multisigAddress}`);
	console.log(`Submitted values : approveAsMulti(${threshold},
		otherSignatories: ${JSON.stringify(otherSignatories)},
		${TIME_POINT},
		${call.method.hash},
		${MAX_WEIGHT})\n`
	);
	console.log(`approveAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);
}

