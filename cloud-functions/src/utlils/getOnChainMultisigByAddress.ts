import axios from 'axios';
import { responseMessages } from '../constants/response_messages';
import { SUBSCAN_API_HEADERS } from '../constants/subscan_consts';

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
			headers: SUBSCAN_API_HEADERS
		});

		returnValue.data = response.data;
	} catch (err) {
		console.log('Error in getAccountOnChainMultisigs:', err);
		returnValue.error = String(err) || responseMessages.onchain_multisig_fetch_error;
	}

	return returnValue;
}
