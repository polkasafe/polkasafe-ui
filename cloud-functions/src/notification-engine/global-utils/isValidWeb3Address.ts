import getSubstrateAddress from './getSubstrateAddress';
import Web3 from 'web3';

export default function isValidWeb3Address(address: string): boolean {
	try {
		return Boolean(getSubstrateAddress(address) || Web3.utils.isAddress(address));
	} catch (error) {
		return false;
	}
}
