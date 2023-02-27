// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC } from 'react';
import { ITransactions } from 'src/components/Transactions/History';
import Transaction from 'src/components/Transactions/History/Transaction';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';

import NoTransactionsQueued from './NoTransactionsQueued';

interface IQueuedProps {
    transactionsQueued?: ITransactions[];
}
const Queued: FC<IQueuedProps> = ({ transactionsQueued }) => {
	console.log(transactionsQueued);
	const { address } = useGlobalUserDetailsContext();
	return (
		<>
			{(transactionsQueued && transactionsQueued.length > 0)? <div className='flex flex-col gap-y-[10px]'>
				{transactionsQueued.map((transaction, index) => {
					return <section key={index}>
						{/* <h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
							{created_at}
						</h4> */}
						<Transaction
							amount={String(transaction.amount_token)}
							amountType={transaction.token}
							date={dayjs(transaction.created_at).toISOString()}
							status={'Success'}
							type={address === transaction.from ? 'Sent' : 'Received'}
							id={Number(transaction.id)}
							recipientAddress={transaction.to}
						/>;
					</section>;
				})}
			</div>: <NoTransactionsQueued/>}
		</>
	);
};

export default Queued;