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

export async function cancelMultisigTransfer ({ amount, api, approvingAddress, recipientAddress, multisig, network }: Props) {
	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// 2. Set relevant constants
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

	// 5. Send cancelAsMulti if last approval call
	let txHash;
	if (numApprovals < multisig.threshold - 1) {
		// cannot cancel if not last approval
		return;
	} else {
		txHash = await api.tx.multisig
			.cancelAsMulti(multisig.address, otherSignatories, TIME_POINT, call.method.toHex())
			.signAndSend(approvingAddress);
	}

	console.log(`Sending ${displayAmount} from ${multisig.address} to ${recipientAddress}`);
	console.log(`Submitted values: cancelAsMulti(${multisig.threshold}, otherSignatories: ${JSON.stringify(otherSignatories, null, 2)}, ${TIME_POINT}, ${call.method.hash})\n`);
	console.log(`cancelAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);
}
