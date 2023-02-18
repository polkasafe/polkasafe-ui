import axios from 'axios';
import { responseMessages, SUBSCAN_API_KEY } from '../constants';
import { ITransaction } from '../types';
import dayjs from 'dayjs';

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
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-API-Key': SUBSCAN_API_KEY
			}
		});

		const transactions: ITransaction[] = [];

		if (response.data && response.data.transfers?.length) {
			response.data.transfers.forEach((transfer: any) => {
				const newTransaction: ITransaction = {
					callHash: transfer.hash,
					created_at: dayjs(transfer.block_timestamp).toDate(),
					from: transfer.from,
					to: transfer.to,
					id: transfer.hash,
					token: transfer.asset_symbol,
					amount_usd: Number(transfer.usd_amount),
					amount_token: Number(transfer.amount),
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

