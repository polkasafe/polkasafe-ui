// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';

import NoTransactionsHistory from './NoTransactionsHistory';
import Transaction from './Transaction';

export interface ITransaction {
    amount: string;
    amountType: string;
    id: number;
    status: 'Success' | 'Failed' | 'Pending';
    time: string;
    type: 'Sent' | 'Received';
}

export interface ITransactions {
    date: string,
    transactions: ITransaction[],
}

interface IHistoryProps {
    transactionsHistory: ITransactions[];
}

const History: FC<IHistoryProps> = ({ transactionsHistory }) => {
	return (
		<>
			{transactionsHistory.length > 0? <div>
				{transactionsHistory.map(({ date, transactions }, index) => {
					return <section key={index} className='mt-[30.5px]'>
						<h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
							{date}
						</h4>
						<div className='flex flex-col gap-y-[10px]'>
							{transactions.map((transaction, index) => {
								return <Transaction
									date={date}
									key={index}
									{...transaction}
								/>;
							})}
						</div>
					</section>;
				})}
			</div>: <NoTransactionsHistory/>}
		</>
	);
};

export default History;