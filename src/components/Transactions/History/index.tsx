// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC } from 'react';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';

import NoTransactionsHistory from './NoTransactionsHistory';
import Transaction from './Transaction';

// TODO: REMOVE ITransaction and ITransactions from here use ITransaction from src/types.ts
export interface ITransaction {
    amount: string;
    amountType: string;
    status: 'Success' | 'Failed';
    type: 'Sent' | 'Received';
		id: number;
}

export interface ITransactions {
	callHash: string;
	created_at: Date;
	block_number: number;
	from: string;
	to: string;
	id: string;
	token: string;
	amount_usd: number;
	amount_token: number;
	network: string;
}

interface IHistoryProps {
    transactionsHistory?: ITransactions[];
}

const History: FC<IHistoryProps> = ({ transactionsHistory }) => {
	const { address } = useGlobalUserDetailsContext();
	return (
		<>
			{(transactionsHistory && transactionsHistory.length > 0)? <div className='flex flex-col gap-y-[10px]'>
				{transactionsHistory.map((transaction, index) => {
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
							id={Number(transaction.callHash)}
						/>;
					</section>;
				})}
			</div>: <NoTransactionsHistory/>}
		</>
	);
};

export default History;