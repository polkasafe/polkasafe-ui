// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import { IMultisigAddress } from 'src/types';

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
	let txHash;
	if (numApprovals < multisig.threshold - 1) {
		txHash = await api.tx.multisig
			.approveAsMulti(multisig.threshold, otherSignatories, TIME_POINT, call.method.toHex(), MAX_WEIGHT)
			.signAndSend(approvingAddress);
	} else {
		txHash = await api.tx.multisig
			.asMulti(multisig.threshold, otherSignatories, TIME_POINT, call.method.toHex(), MAX_WEIGHT)
			.signAndSend(approvingAddress);
	}

	console.log(`Sending ${displayAmount} from ${multisig.address} to ${recipientAddress}`);
	console.log(`Submitted values: asMulti(${multisig.threshold}, otherSignatories: ${JSON.stringify(otherSignatories, null, 2)}, ${TIME_POINT}, ${call.method.hash}, ${MAX_WEIGHT})\n`);
	console.log(`asMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);
}
