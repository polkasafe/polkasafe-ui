// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';

export async function addAttachment ({ network, callHash, subfield, file } : { network: string, callHash: string, subfield: string, file: any }): Promise<{data?: { url: string }, error: string} | any> {

	const bodyContent = new FormData();
	bodyContent.append('tx_hash', callHash);
	bodyContent.append('field_key', subfield);
	bodyContent.append('file', file);

	console.log('file', file);

	const addAttachmentRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/addAttachment`, {
		body: bodyContent,
		headers: firebaseFunctionsHeader(network, '', '', 'multipart/form-data; boundary=-XXX---'),
		method: 'POST'
	});

	return (await addAttachmentRes.json());
}