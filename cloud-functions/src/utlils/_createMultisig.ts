import { encodeAddress, encodeMultiAddress } from '@polkadot/util-crypto';
import { responseMessages } from '../constants/response_messages';

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
		return { error: String(error) || responseMessages.internal };
	}
}
