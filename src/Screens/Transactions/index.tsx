// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classNames from 'classnames';
import React, { useState } from 'react';
import Filter from 'src/components/Transactions/Filter';
import History, { ITransactionsHistory } from 'src/components/Transactions/History';

enum ETab {
	QUEUE,
	HISTORY
}

const transactionsHistory: ITransactionsHistory[] = [
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
						<History transactionsHistory={transactionsHistory} />
						:null
				}
			</div>
		</>
	);
};

export default Transactions;