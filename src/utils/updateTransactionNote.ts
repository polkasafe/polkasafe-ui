// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';

interface Args {
	callHash: string;
	multisigAddress?: string;
	note: string;
	network: string
}

export default async function updateTransactionNote({
	callHash,
	multisigAddress,
	note,
	network
}: Args): Promise<{ data?: any, error?: string }> {
	const editNoteRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/updateTransactionNote `, {
		body: JSON.stringify({
			callHash,
			multisigAddress : multisigAddress || '',
			note
		}),
		headers: firebaseFunctionsHeader(network),
		method: 'POST'
	});

	return (await editNoteRes.json() as { data?: any, error?: string });
}