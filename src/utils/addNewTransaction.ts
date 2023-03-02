// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import { FIREBASE_FUNCTIONS_HEADER } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { ITransaction } from 'src/types';

import formatBnBalance from './formatBnBalance';

type Args = Omit<ITransaction, 'created_at' | 'amount_usd' | 'amount_token' | 'id' | 'token'> & { amount: BN};

export async function addNewTransaction ({ amount, network, block_number, callData, callHash, from, to } : Args): Promise<{data?: ITransaction, error: string} | any> {

	const newTransactionData: Omit<Args, 'amount'> & { amount_token: Number} = {
		amount_token: Number(formatBnBalance(amount, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network)),
		block_number,
		callData,
		callHash,
		from,
		network,
		to
	};

	const setTransactionResponse = await fetch(`${FIREBASE_FUNCTIONS_URL}/addTransaction`, {
		body: JSON.stringify(newTransactionData),
		headers: FIREBASE_FUNCTIONS_HEADER,
		method: 'POST'
	});

	return (await setTransactionResponse.json());
}