import axios from 'axios';
import { DEFAULT_MULTISIG_NAME, responseMessages, SUBSCAN_API_KEY } from '../constants';

interface IResponse {
	error?: string | null;
	data: {
		name: string;
		signatories: string[];
		threshold: number;
	};
}

export default async function getOnChainMultisigMetaData(multisigAddress: string, network: string): Promise<IResponse> {
	const returnValue: IResponse = {
		error: '',
		data: {
			name: DEFAULT_MULTISIG_NAME,
			signatories: [],
			threshold: 0
		}
	};

	try {
		const { data: response } = await axios.post(`https://${network}.api.subscan.io/api/v2/scan/search`, {
			'row': 1,
			'key': multisigAddress
		}, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-API-Key': SUBSCAN_API_KEY
			}
		});

		returnValue.data = {
			name: response?.data?.account?.account_display.display || DEFAULT_MULTISIG_NAME,
			signatories: response?.data?.account?.multisig?.multi_account_member?.map((obj: any) => obj.address) || [],
			threshold: response?.data?.account?.multisig?.threshold || null
		};
	} catch (err) {
		console.log('Error in getAccountOnChainMultisigs:', err);
		returnValue.error = String(err) || responseMessages.onchain_multisig_fetch_error;
	}

	return returnValue;
}
