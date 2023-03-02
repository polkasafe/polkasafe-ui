import axios from 'axios';
import { ITransaction } from '../types';
import dayjs from 'dayjs';
import { SUBSCAN_API_HEADERS } from '../constants/subscan_consts';
import { responseMessages } from '../constants/response_messages';

interface IResponse {
	error?: string | null;
	data: ITransaction[];
}

export default async function getTransactionsByAddress(multisigAddress: string, network: string, entries: number, page: number): Promise<IResponse> {
	const returnValue: IResponse = {
		error: '',
		data: []
	};

	try {
		const { data: response } = await axios.post(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
			'row': entries || 1,
			'page': page - 1 || 0, // pages start from 0
			'address': multisigAddress,
			'currency': 'token'
		}, {
			headers: SUBSCAN_API_HEADERS
		});

		const transactions: ITransaction[] = [];

		if (response.data && response.data.transfers?.length) {
			response.data.transfers.forEach((transfer: any) => {
				const newTransaction: ITransaction = {
					callHash: transfer.hash,
					created_at: dayjs(transfer.block_timestamp).toDate(),
					from: transfer.from,
					to: transfer.to,
					token: transfer.asset_symbol,
					amount_usd: String(transfer.usd_amount),
					amount_token: String(transfer.amount),
					block_number: Number(transfer.block_num),
					network: network
				};

				transactions.push(newTransaction);
			});
		}

		returnValue.data = transactions;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || responseMessages.transfers_fetch_error;
	}

	return returnValue;
}

