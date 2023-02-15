import { BN } from '@polkadot/util';
import { keyring } from '@polkadot/ui-keyring';
import { responseMessages } from '../constants';

interface CreateOptions {
  genesisHash?: string;
  name: string;
  tags?: string[];
}

interface CreateMultisigResponse {
	multisigAddress?: string;
	error?: string;
}

export default function _createMultisig(
	signatories: string[], threshold: BN | number, { genesisHash, name, tags = [] }: CreateOptions ): CreateMultisigResponse {
	try {
		const result = keyring.addMultisig(signatories, threshold, { genesisHash, name, tags });
		const { address } = result.pair;

		return { multisigAddress: address };
	} catch (error) {
		return { error: String(error) || responseMessages.internal };
	}
}
