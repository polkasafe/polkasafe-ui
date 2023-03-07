import axios from 'axios';
import { DEFAULT_MULTISIG_NAME } from '../constants/defaults';
import { responseMessages } from '../constants/response_messages';
import { SUBSCAN_API_HEADERS } from '../constants/subscan_consts';

interface IResponse {
	error?: string | null;
	data: {
		name: string;
		signatories: string[];
		threshold: number;
		balance: string;
	};
}

export default async function getOnChainMultisigMetaData(multisigAddress: string, network: string): Promise<IResponse> {
	const returnValue: IResponse = {
		error: '',
		data: {
			name: DEFAULT_MULTISIG_NAME,
			signatories: [],
			threshold: 0,
			balance: '0'
		}
	};

	try {
		const { data: response } = await axios.post(`https://${network}.api.subscan.io/api/v2/scan/search`, {
			'row': 1,
			'key': multisigAddress
		}, {
			headers: SUBSCAN_API_HEADERS
		});

		returnValue.data = {
			name: response?.data?.account?.account_display.display || DEFAULT_MULTISIG_NAME,
			signatories: response?.data?.account?.multisig?.multi_account_member?.map((obj: any) => obj.address) || [],
			threshold: response?.data?.account?.multisig?.threshold || null,
			balance: response?.data?.account?.balance || '0'
		};
	} catch (err) {
		console.log('Error in getAccountOnChainMultisigs:', err);
		returnValue.error = String(err) || responseMessages.onchain_multisig_fetch_error;
	}

	return returnValue;
}
