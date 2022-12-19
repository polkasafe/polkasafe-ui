// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import Filter from 'src/Screens/Transactions/Filter';

import NoTransactionsHistory from './NoTransactionsHistory';
import Transaction from './Transaction';

export interface ITransaction {
    amount: string,
    amountType: string,
    no: number,
    status: 'Success' | 'Fail' | 'Needs Confirmation'
    time: string,
    type: 'Sent' | 'Received',
}

export interface ITransactionsHistory {
    date: string,
    transactions: ITransaction[],
}

interface IHistoryProps {
	filter?: boolean;
    transactionsHistory: ITransactionsHistory[];
}

const History: FC<IHistoryProps> = ({ filter, transactionsHistory }) => {
	if (filter) {
		return <Filter/>;
	}
	return (
		<>
			{transactionsHistory.length > 0? <div>
				{transactionsHistory.map(({ date, transactions }, index) => {
					return <section key={index} className='flex flex-col items-start'>
						<h4 className='font-semibold text-blue_primary uppercase pb-3 border-b my-3'>
							{date}
						</h4>
						<div className='w-full flex flex-col gap-y-5'>
							{transactions.map((transaction, index) => {
								return <Transaction key={index} {...transaction} />;
							})}
						</div>
					</section>;
				})}
			</div>:<NoTransactionsHistory/>}
		</>
	);
};

export default History;