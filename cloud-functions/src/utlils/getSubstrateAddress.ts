import { encodeAddress } from '@polkadot/util-crypto';

export default function getSubstrateAddress(address: string): string {
	try {
		return encodeAddress(address, 42);
	} catch (_err) {
		return '';
	}
}
