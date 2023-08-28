import axios from 'axios';
import { ITransaction } from '../types';
import { SUBSCAN_API_HEADERS } from '../constants/subscan_consts';
import { responseMessages } from '../constants/response_messages';
import dayjs from 'dayjs';
import { firestore } from 'firebase-admin';

interface IResponse {
	error?: string | null;
	data: ITransaction[];
    count: number;
}

export default async function getHistoryTransactions(
	multisigAddress: string,
	network: string,
	entries: number,
	page: number,
	firestoreDB: firestore.Firestore
): Promise<IResponse> {
	const returnValue: IResponse = {
		count: 0,
		error: '',
		data: []
	};

	try {
		const transactions: ITransaction[] = [];

		const { data: otherTransactions } = await axios.post(`https://${network}.api.subscan.io/api/scan/multisigs`, {
			'row': entries || 1,
			'page': page - 1 || 0, // pages start from 0
			'account': multisigAddress
		}, {
			headers: SUBSCAN_API_HEADERS
		});

		if (otherTransactions.data && otherTransactions.data.multisig?.length) {
			for (const transaction of otherTransactions.data.multisig) {
				if (transaction.status !== 'Executed') continue;
				// const fetchPriceRes = await fetch(`https://api.currencyapi.com/v3/historical?apikey=${CURRENCY_API_KEY}&currencies=${currencyProperties[currency].symbol}&date=${dayjs(transaction.block_timestamp * 1000).format('YYYY-MM-DD')}`, {
				// method: 'GET'
				// });
				// const responseJSON = await fetchPriceRes.json();
				// const currencyPrice = responseJSON.data?.[currencyProperties[currency].symbol]?.value || '1';

				const { data: multisigData } = await axios.post(`https://${network}.api.subscan.io/api/scan/multisig`, {
					'multi_id': transaction.multi_id,
					'call_hash': transaction.call_hash
				}, {
					headers: SUBSCAN_API_HEADERS
				});

				const transactionDoc = await firestoreDB.collection('transactions').doc(transaction.call_hash).get();
				const txn: ITransaction = transactionDoc.data() as ITransaction;

				const newTransaction: ITransaction = {
					amount_token: transactionDoc.exists && txn?.amount_token ? txn?.amount_token : '',
					approvals: multisigData?.data?.process?.filter((item: any) => item.status === 'Approval' || item.status === 'Executed').map((item: any) => item.account_display.address),
					amount_usd: String(Number(transaction.usd_amount) * Number(1)),
					block_number: Number(transaction.block_num || 0),
					callHash: transaction.call_hash,
					callData: multisigData?.data?.call_data || '',
					created_at: dayjs(transaction.block_timestamp * 1000).toDate(),
					from: transaction.multi_account_display.address,
					network: network,
					to: transaction.to,
					token: transaction.asset_symbol
				};
				transactions.push(newTransaction);
			}
		}

		const { data: response } = await axios.post(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
			'row': entries || 1,
			'page': page - 1 || 0, // pages start from 0
			'address': multisigAddress,
			'currency': 'token'
		}, {
			headers: SUBSCAN_API_HEADERS
		});

		if (response.data && response.data.transfers?.length) {
			for (const transfer of response.data.transfers) {
				const transactionDoc = await firestoreDB.collection('transactions').doc(transfer.hash).get();
				const transaction: ITransaction = transactionDoc.data() as ITransaction;

				if (transfer.to === multisigAddress) {
					const newTransaction: ITransaction = {
						approvals: transactionDoc.exists && transaction.approvals ? transaction.approvals : [],
						amount_token: (transfer.amount),
						amount_usd: String(Number(transfer.usd_amount) * Number(1)),
						block_number: Number(transfer.block_num),
						callHash: transfer.hash,
						created_at: dayjs(transfer.block_timestamp * 1000).toDate(),
						from: transfer.from,
						network: network,
						to: transfer.to,
						token: transfer.asset_symbol
					};

					transactions.push(newTransaction);
				}
			}
		}

		returnValue.data = transactions;
		returnValue.count = transactions.length;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || responseMessages.transfers_fetch_error;
	}

	return returnValue;
}
