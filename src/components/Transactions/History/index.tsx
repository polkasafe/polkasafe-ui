// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { IHistoryTransaction } from 'src/types';

import NoTransactionsHistory from './NoTransactionsHistory';
import Transaction from './Transaction';

interface IHistoryProps {
    transactionsHistory?: IHistoryTransaction[];
}

const History: FC<IHistoryProps> = ({ transactionsHistory }) => {
	return (
		<>
			{(transactionsHistory && transactionsHistory.length > 0)? <div className='flex flex-col gap-y-[10px]'>
				{transactionsHistory.map((transaction, index) => {
					return <section key={index}>
						{/* <h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
							{created_at}
						</h4> */}
						<Transaction {...transaction} />;
					</section>;
				})}
			</div>: <NoTransactionsHistory/>}
		</>
	);
};

export default History;