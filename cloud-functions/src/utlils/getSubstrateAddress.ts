import { encodeAddress } from '@polkadot/util-crypto';

export default function getSubstrateAddress(address: string): string {
	return encodeAddress(address, 42);
}
