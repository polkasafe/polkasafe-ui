// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import dayjs from 'dayjs';
import { SUBSCAN_API_HEADERS } from 'src/global/subscan_consts';
import { responseMessages } from 'src/global/subscan_messages';

import { ITransaction } from '../types';

interface IResponse {
	error?: string | null;
	data: ITransaction[];
}

export default async function getHistoryTransactions(
	multisigAddress: string,
	network: string,
	entries: number,
	page: number
): Promise<IResponse> {
	const returnValue: IResponse = {
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

		const response = await data.json();

		const transactions: ITransaction[] = [];

		if (response.data && response.data.transfers?.length) {
			for (const transfer of response.data.transfers) {
				const newTransaction: ITransaction = {
					amount_token: Number(transfer.amount),
					amount_usd: Number(transfer.usd_amount),
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
	} catch (err) {
		console.log('Error in getTransfersByAddress:', err);
		returnValue.error = String(err) || responseMessages.transfers_fetch_error;
	}

	return returnValue;
}

