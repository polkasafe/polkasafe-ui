import axios from 'axios';
import { chainProperties } from '../constants/network_constants';
import { SUBSCAN_API_HEADERS } from '../constants/subscan_consts';

export default async function fetchTokenUSDValue(network: string): Promise<number | null> {
	const { data: response } = await axios.post(`https://${network}.api.subscan.io/api/open/price_converter`, {
		from: chainProperties[network].tokenSymbol,
		quote: 'USD',
		value: 1
	}, {
		headers: SUBSCAN_API_HEADERS
	});

	if (response?.message == 'Success' && response?.data?.output) {
		return Number(response?.data?.output);
	} else {
		return null;
	}
}
