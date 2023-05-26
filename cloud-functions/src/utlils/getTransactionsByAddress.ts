import axios from 'axios';
import { ITransaction } from '../types';
import dayjs from 'dayjs';
import { SUBSCAN_API_HEADERS } from '../constants/subscan_consts';
import { responseMessages } from '../constants/response_messages';
import { firestore } from 'firebase-admin';

interface IResponse {
	error?: string | null;
	data: ITransaction[];
}

export default async function getTransactionsByAddress(
	multisigAddress: string,
	network: string,
	entries: number,
	page: number,
	firestoreDB: firestore.Firestore
): Promise<IResponse> {
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
			for (const transfer of response.data.transfers) {
				const transactionDoc = await firestoreDB.collection('transactions').doc(transfer.hash).get();
				const storedTransaction: ITransaction = transactionDoc.data() as ITransaction;

				const newTransaction: ITransaction = {
					callHash: transfer.hash,
					created_at: dayjs(transfer.block_timestamp * 1000).toDate(),
					from: transfer.from,
					to: transfer.to,
					token: transfer.asset_symbol,
					amount_usd: String(transfer.usd_amount),
					amount_token: String(transfer.amount),
					block_number: Number(transfer.block_num),
					network: network,
					note: transactionDoc.exists && storedTransaction?.note ? storedTransaction?.note : '',
					notifications: Object.fromEntries(
						Object.entries(storedTransaction.notifications || {}).map(([address, notification]) =>
							[address, { ...notification, lastNotified: (notification.lastNotified as any)?.toDate?.() }])
					)
				};

				transactions.push(newTransaction);
			}
		}

		returnValue.data = transactions;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || responseMessages.transfers_fetch_error;
	}

	return returnValue;
}

