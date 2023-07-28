// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import { CURRENCY_API_KEY } from 'src/global/currencyApiKey';
import { currencyProperties } from 'src/global/currencyConstants';
import { SUBSCAN_API_HEADERS } from 'src/global/subscan_consts';

import { ITransaction } from '../types';

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

export default async function getHistoryTransactions(
	multisigAddress: string,
	network: string,
	entries: number,
	page: number,
	currency: string
): Promise<IResponse> {
	const returnValue: IResponse = {
		count: 0,
		data: [],
		error: ''
	};

	try {
		const data = await fetch(`https://${network}.api.subscan.io/api/v2/scan/transfers`, {
			body: JSON.stringify({
				'address': multisigAddress,
				'currency': 'token',
				'page': page - 1 || 0, // pages start from 0
				'row': entries || 1
			}),
			headers: SUBSCAN_API_HEADERS,
			method: 'POST'
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
				const fetchPriceRes = await fetch(`https://api.currencyapi.com/v3/historical?apikey=${CURRENCY_API_KEY}&currencies=${currencyProperties[currency].symbol}&date=${dayjs(transaction.block_timestamp * 1000).format('YYYY-MM-DD')}`, {
					method: 'GET'
				});
				const responseJSON = await fetchPriceRes.json();
				const currencyPrice = responseJSON.data?.[currencyProperties[currency].symbol]?.value || '1';
				if((transaction.call_module_function !== CHECKS.TRANSFER_KEEP_ALIVE || transaction.call_module_function !== CHECKS.TRANSFER_KEEP_ALIVE) && transaction.status === CHECKS.STATUS.EXECUTED){
					const newTransaction: ITransaction = {
						amount_token: Number(transaction.amount || 0),
						amount_usd: Number(transaction.usd_amount || 0) * Number(currencyPrice),
						block_number: Number(transaction.block_num || 0),
						callHash: transaction.call_hash,
						created_at: dayjs(transaction.block_timestamp * 1000).toDate(),
						from: transaction.account_display.address,
						id: transaction.call_hash,
						method: transaction.call_module_function,
						network: network,
						section: transaction.call_module,
						to: transaction.to,
						token: transaction.asset_symbol
					};
					transactions.push(newTransaction);
				}
			}
		}

		const response = await data.json();

		if (response.data && response.data.transfers?.length) {
			for (const transfer of response.data.transfers) {
				const fetchPriceRes = await fetch(`https://api.currencyapi.com/v3/historical?apikey=${CURRENCY_API_KEY}&currencies=${currencyProperties[currency].symbol}&date=${dayjs(transfer.block_timestamp * 1000).format('YYYY-MM-DD')}`, {
					method: 'GET'
				});
				const responseJSON = await fetchPriceRes.json();
				const currencyPrice = responseJSON.data?.[currencyProperties[currency].symbol]?.value || '1';

				const newTransaction: ITransaction = {
					amount_token: Number(transfer.amount),
					amount_usd: Number(transfer.usd_amount) * Number(currencyPrice),
					block_number: Number(transfer.block_num),
					callHash: transfer.hash,
					created_at: dayjs(transfer.block_timestamp * 1000).toDate(),
					from: transfer.from,
					id: transfer.hash,
					network: network,
					to: transfer.to,
					token: transfer.asset_symbol
				};

				transactions.push(newTransaction);
			}
		}

		returnValue.data = transactions;
		returnValue.count = response.data.count;
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || 'Something went wrong while fetching data';
	}

	return returnValue;
}

