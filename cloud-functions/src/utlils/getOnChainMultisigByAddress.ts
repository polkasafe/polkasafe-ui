import axios from 'axios';
import { responseMessages, SUBSCAN_API_KEY } from '../constants';

export default async function getOnChainMultisigByAddress(address: string, network: string): Promise<{ error?: string | null, data: any }> {
	const returnValue = {
		error: '',
		data: null
	};

	try {
		const { data: response } = await axios.post(`https://${network}.api.subscan.io/api/scan/multisigs`, {
			'row': 1,
			'account': address
		}, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-API-Key': SUBSCAN_API_KEY
			}
		});

		returnValue.data = response.data;
	} catch (err) {
		console.log('Error in getAccountOnChainMultisigs:', err);
		returnValue.error = String(err) || responseMessages.onchain_multisig_fetch_error;
	}

	return returnValue;
}
