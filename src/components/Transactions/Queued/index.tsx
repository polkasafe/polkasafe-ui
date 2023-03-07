// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IQueueItem } from 'src/types';
import getNetwork from 'src/utils/getNetwork';

import NoTransactionsQueued from './NoTransactionsQueued';
import Transaction from './Transaction';

const network = getNetwork();

const Queued: FC = () => {
	const [loading, setLoading] = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { address, activeMultisig } = useGlobalUserDetailsContext();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [queuedTransactions, setQueuedTransactions] = useState<IQueueItem[]>([]);

	const fetchQueuedTransactions = useCallback(async () => {
		try{
			setLoading(true);
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature) {
				console.log('ERROR');
				setLoading(false);
				return;
			}
			else{

				console.log(activeMultisig);

				const getQueueTransactions = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigQueue`, {
					body: JSON.stringify({
						limit: 10,
						multisigAddress: activeMultisig,
						network,
						page: 1
					}),
					headers: firebaseFunctionsHeader(),
					method: 'POST'
				});

				const { data: queueTransactions, error: queueTransactionsError } = await getQueueTransactions.json() as { data: IQueueItem[], error: string };

				if(queueTransactionsError) {
					setLoading(false);
					return;
				}

				if(queueTransactions){
					console.log('queue', queueTransactions);
					setQueuedTransactions(queueTransactions);
					setLoading(false);
				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeMultisig]);

	useEffect(() => {
		fetchQueuedTransactions();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if(loading){
		return (
			<div className='flex justify-center items-center h-full'>
				<h2 className='font-bold text-xl leading-[22px] text-primary'>
					Loading...
				</h2>
			</div>
		);
	}

	return (
		<>
			{(queuedTransactions && queuedTransactions.length > 0)? <div className='flex flex-col gap-y-[10px]'>
				{queuedTransactions.map((transaction, index) => {
					return <section key={index}>
						{/* <h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
							{created_at}
						</h4> */}
						<Transaction
							date={dayjs(transaction.created_at).toISOString()}
							status={transaction.status}
							type={ 'Sent' }
							approvals={transaction.approvals}
							threshold={transaction.threshold}
							callData={transaction.callData}
							callHash={transaction.callHash}
						/>
					</section>;
				})}
			</div>: <NoTransactionsQueued/>}
		</>
	);
};

export default Queued;