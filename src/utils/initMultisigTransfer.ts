// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ApiPromise } from '@polkadot/api';
import { formatBalance } from '@polkadot/util/format';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import { IMultisigAddress } from 'src/types';

interface Args {
	api: ApiPromise,
	recipientAddress: string,
	initiatorAddress: string,
	multisig: IMultisigAddress,
	amount: BN,
	network: string
}

export default async function initMultisigTransfer({
	api,
	recipientAddress,
	initiatorAddress,
	multisig,
	amount,
	network
}: Args) {

	// 1. Use formatBalance to display amounts
	formatBalance.setDefaults({
		decimals: chainProperties[network].tokenDecimals,
		unit: chainProperties[network].tokenSymbol
	});

	// 2. Define relevant constants
	const MAX_WEIGHT = '640000000';
	const AMOUNT_TO_SEND = amount.toNumber();
	const displayAmount = formatBalance(AMOUNT_TO_SEND);

	// remove initator address from signatories
	const otherSignatories =  multisig.signatories.sort().filter((signatory) => signatory !== initiatorAddress);

	// 3. API calls - info is necessary for the timepoint
	const call = api.tx.balances.transfer(recipientAddress, AMOUNT_TO_SEND);

	// 4. Set the timepoint
	// null for transaction initiation
	const TIME_POINT = null;

	// 5. first call is approveAsMulti
	const txHash = await api.tx.multisig
		.approveAsMulti(multisig.threshold, otherSignatories, TIME_POINT, call.method.hash, MAX_WEIGHT)
		.signAndSend(initiatorAddress);

	console.log(`Sending ${displayAmount} from multisig: ${multisig.address} to ${recipientAddress}, initiated by ${initiatorAddress}`);
	console.log(`Submitted values : approveAsMulti(${multisig.threshold},
		otherSignatories: ${JSON.stringify(otherSignatories)},
		${TIME_POINT},
		${call.method.hash},
		${MAX_WEIGHT})\n`
	);
	console.log(`approveAsMulti tx: https://${network}.subscan.io/extrinsic/${txHash}`);
}