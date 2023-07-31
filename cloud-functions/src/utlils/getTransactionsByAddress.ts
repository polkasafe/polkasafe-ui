import axios from 'axios';
import { ITransaction } from '../types';
import dayjs from 'dayjs';
import { SUBSCAN_API_HEADERS } from '../constants/subscan_consts';
import { responseMessages } from '../constants/response_messages';
import { firestore } from 'firebase-admin';
import { currencyProperties } from './currencyConstants';

export const CURRENCY_API_KEY = process.env.REACT_APP_ENV === 'dev' ? 'cur_live_8NlGKWBefFI9XHVAIgcWweO5AjhEMUr8oqJFrmra' : 'cur_live_ZGW68myNKB7GoRvr86Ft6qYtDPMC1gkBolKl5DLw' ;

interface IResponse {
	error?: string | null;
	data: ITransaction[];
	count: number;
}

const CHECKS = {
	STATUS:{
		EXECUTED:'Executed'
	},
	TRANSFER_KEEP_ALIVE:'transfer_keep_alive'
};

export default async function getTransactionsByAddress(
	multisigAddress: string,
	network: string,
	entries: number,
	page: number,
	firestoreDB: firestore.Firestore,
	currency: string
): Promise<IResponse> {
	const returnValue: IResponse = {
		error: '',
		data: [],
		count:0
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

		const customTransactions = await fetch(`https://${network}.api.subscan.io/api/scan/multisigs`, {
			body: JSON.stringify({
				'account': multisigAddress,
				'currency': 'token',
				'page': page - 1 || 0, // pages start from 0
				'row': entries || 1
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
		});

		const otherTransactions: any = await customTransactions.json();

		if (otherTransactions.data && otherTransactions.data.multisig?.length) {
			for (const transaction of otherTransactions.data.multisig) {
				
				const responseJSON = await axios.get(`https://api.currencyapi.com/v3/historical?apikey=${CURRENCY_API_KEY}&currencies=${currencyProperties[currency].symbol}&date=${dayjs(transaction.block_timestamp * 1000).format('YYYY-MM-DD')}`);
				
				const currencyPrice = responseJSON.data?.[currencyProperties[currency].symbol]?.value || '1';
				
				if((transaction.call_module_function !== CHECKS.TRANSFER_KEEP_ALIVE || transaction.call_module_function !== CHECKS.TRANSFER_KEEP_ALIVE) && transaction.status === CHECKS.STATUS.EXECUTED){
					const transactionDoc = await firestoreDB.collection('transactions').doc
					(transaction.call_hash).get();
					const transactionData: ITransaction = transactionDoc.data() as ITransaction;
					const newTransaction: ITransaction = {
						amount_token: String(transaction.amount || 0),
						amount_usd: String(Number(transaction.usd_amount || 0) * Number(currencyPrice)),
						block_number: Number(transaction.block_num || 0),
						callHash: transaction.call_hash,
						created_at: dayjs(transaction.block_timestamp * 1000).toDate(),
						from: transaction.account_display.address,
						id: transaction.call_hash,
						method: transaction.call_module_function,
						network: network,
						section: transaction.call_module,
						to: transaction.to,
						token: transaction.asset_symbol,
						transactionFields: transactionDoc.exists && transactionData?.transactionFields ? transactionData?.transactionFields : { category: 'none', subfields: {} },
					};
					transactions.push(newTransaction);
				}
			}
		}

		if (response.data && response.data.transfers?.length) {
			for (const transfer of response.data.transfers) {

				const responseJSON = await axios.get(`https://api.currencyapi.com/v3/historical?apikey=${CURRENCY_API_KEY}&currencies=${currencyProperties[currency].symbol}&date=${dayjs(transfer.block_timestamp * 1000).format('YYYY-MM-DD')}`);
				
				const currencyPrice = responseJSON.data?.[currencyProperties[currency].symbol]?.value || '1';
				const transactionDoc = await firestoreDB.collection('transactions').doc
					(transfer.call_hash).get();
					const transactionData: ITransaction = transactionDoc.data() as ITransaction;
				const newTransaction: ITransaction = {
					amount_token: String(transfer.amount),
					amount_usd: String(Number(transfer.usd_amount) * Number(currencyPrice)),
					block_number: Number(transfer.block_num),
					callHash: transfer.hash,
					created_at: dayjs(transfer.block_timestamp * 1000).toDate(),
					from: transfer.from,
					id: transfer.hash,
					network: network,
					to: transfer.to,
					token: transfer.asset_symbol,
					transactionFields: transactionDoc.exists && transactionData?.transactionFields ? transactionData?.transactionFields : { category: 'none', subfields: {} },
				};
				transactions.push(newTransaction);
			}
		}

		returnValue.data = transactions;
		returnValue.count = response.data.count;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || responseMessages.transfers_fetch_error;
	}

	return returnValue;
}

