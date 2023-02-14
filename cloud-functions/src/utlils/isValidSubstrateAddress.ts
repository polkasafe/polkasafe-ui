import { checkAddress } from '@polkadot/util-crypto';

export default function isValidSubstrateAddress(address:string): boolean {
	return Boolean(checkAddress(address, 42));
}
