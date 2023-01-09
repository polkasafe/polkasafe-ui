// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { ITransactions } from 'src/components/Transactions/History';
import Transaction from 'src/components/Transactions/History/Transaction';

import NoTransactionsQueued from './NoTransactionsQueued';

interface IQueuedProps {
    transactionsQueued: ITransactions[];
}
const Queued: FC<IQueuedProps> = ({ transactionsQueued }) => {
	return (
		<>
			{transactionsQueued.length > 0? <div>
				{transactionsQueued.map(({ date, transactions }, index) => {
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
			</div>: <NoTransactionsQueued />}
		</>
	);
};

export default Queued;