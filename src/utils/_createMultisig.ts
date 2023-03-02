// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { encodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';

// import { responseMessages } from '../constants/response_messages';

interface CreateMultisigResponse {
	multisigAddress?: string;
	error?: string;
}

export default function _createMultisig(signatories: string[], threshold: number, ss58Format: number ): CreateMultisigResponse {
	try {
		const encodedSignatories = signatories.map((signatory) => encodeAddress(signatory, ss58Format));
		const multisigAddress = encodeMultiAddress(encodedSignatories, threshold);

		return { multisigAddress };
	} catch (error) {
		return { error: String(error) || '' };
	}
}
