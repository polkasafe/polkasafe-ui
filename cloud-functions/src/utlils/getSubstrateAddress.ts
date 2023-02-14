import { encodeAddress } from '@polkadot/util-crypto';

export default function getSubstrateAddress(address: string): string {
	if (address.startsWith('0x')) return address;
	return encodeAddress(address, 42);
}
