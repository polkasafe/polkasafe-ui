// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { ITransactions } from 'src/components/Transactions/History';
import Transaction from 'src/components/Transactions/History/Transaction';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IQueueItem } from 'src/types';
import queueNotification from 'src/ui-components/QueueNotification';
import { NotificationStatus } from 'src/ui-components/types';
import getNetwork from 'src/utils/getNetwork';

import NoTransactionsQueued from './NoTransactionsQueued';

interface IQueuedProps {
    transactionsQueued?: ITransactions[];
}

const network = getNetwork();

const Queued: FC<IQueuedProps> = ({ transactionsQueued }) => {
	const [loading, setLoading] = useState<boolean>(false);
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

				const getQueueTransactions = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigQueue`, {
					body: JSON.stringify({
						limit: 10,
						multisigAddress: activeMultisig,
						network,
						page: 1
					}),
					headers: firebaseFunctionsHeader,
					method: 'POST'
				});

				const { data: queueTransactions, error: queueTransactionsError } = await getQueueTransactions.json() as { data: IQueueItem[], error: string };

				if(queueTransactionsError) {

					queueNotification({
						header: 'Error!',
						message: queueTransactionsError,
						status: NotificationStatus.ERROR
					});
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
			<div className='flex justify-center items-center'>
				<h2 className='font-bold text-xl leading-[22px] text-primary'>
						Loading...
				</h2>
			</div>
		);
	}

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