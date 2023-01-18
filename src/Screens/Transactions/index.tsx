// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classNames from 'classnames';
import React, { useState } from 'react';
import Filter from 'src/components/Transactions/Filter';
import History, { ITransactions } from 'src/components/Transactions/History';
import Queued from 'src/components/Transactions/Queued';

enum ETab {
	QUEUE,
	HISTORY
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const transactions: ITransactions[] = [
	{
		date: 'DEC 22, 2022',
		transactions: [
			{
				amount: '50',
				amountType: 'DOT',
				id: 1,
				status: 'Success',
				time: '11:15 AM',
				type: 'Received'
			},
			{
				amount: '20',
				amountType: 'DOT',
				id: 2,
				status: 'Success',
				time: '14:00 PM',
				type: 'Sent'
			}
		]
	},
	{
		date: 'DEC 16, 2022',
		transactions: [
			{
				amount: '50',
				amountType: 'DOT',
				id: 1,
				status: 'Success',
				time: '11:15 AM',
				type: 'Received'
			},
			{
				amount: '50',
				amountType: 'DOT',
				id: 1,
				status: 'Success',
				time: '11:15 AM',
				type: 'Received'
			}
		]
	}
];
const pendingTransactions: ITransactions[] = [
	{
		date: 'DEC 22, 2022',
		transactions: [
			{
				amount: '150',
				amountType: 'DOT',
				id: 1,
				status: 'Pending',
				time: '12:15 AM',
				type: 'Received'
			},
			{
				amount: '100',
				amountType: 'DOT',
				id: 2,
				status: 'Pending',
				time: '16:00 PM',
				type: 'Sent'
			}
		]
	},
	{
		date: 'DEC 16, 2022',
		transactions: [
			{
				amount: '50',
				amountType: 'DOT',
				id: 1,
				status: 'Pending',
				time: '1:15 AM',
				type: 'Sent'
			},
			{
				amount: '250',
				amountType: 'DOT',
				id: 1,
				status: 'Pending',
				time: '8:15 AM',
				type: 'Received'
			}
		]
	}
];

const Transactions = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [tab, setTab] = useState(ETab.QUEUE);
	return (
		<>
			<div
				className='bg-bg-main rounded-xl p-[20.5px]'
			>
				<div
					className='flex items-center'
				>
					<button
						onClick={() => setTab(ETab.QUEUE)}
						className={classNames(
							'rounded-lg p-3 font-medium text-sm leading-[15px] w-[100px] text-white',
							{
								'text-primary bg-highlight': tab === ETab.QUEUE
							}
						)}
					>
						Queue
					</button>
					<button
						onClick={() => setTab(ETab.HISTORY)}
						className={classNames(
							'rounded-lg p-3 font-medium text-sm leading-[15px] w-[100px] text-white',
							{
								'text-primary bg-highlight': tab === ETab.HISTORY
							}
						)}
					>
						History
					</button>
					<Filter />
				</div>
				{
					tab === ETab.HISTORY?
						<History transactionsHistory={transactions} />
						:<Queued transactionsQueued={pendingTransactions} />
				}
			</div>
		</>
	);
};

export default Transactions;