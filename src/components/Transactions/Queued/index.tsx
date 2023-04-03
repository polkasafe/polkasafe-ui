// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IQueueItem } from 'src/types';
import Loader from 'src/ui-components/Loader';
import fetchTokenToUSDPrice from 'src/utils/fetchTokentoUSDPrice';

import NoTransactionsQueued from './NoTransactionsQueued';
import Transaction from './Transaction';

const LocalizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(LocalizedFormat);

interface IQueued{
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	refetch: boolean
	setRefetch: React.Dispatch<React.SetStateAction<boolean>>
}

const Queued: FC<IQueued> = ({ loading, setLoading, refetch, setRefetch }) => {
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const [queuedTransactions, setQueuedTransactions] = useState<IQueueItem[]>([]);
	const location = useLocation();
	const [amountUSD, setAmountUSD] = useState<string>('');

	useEffect(() => {
		fetchTokenToUSDPrice(1,network).then((formattedUSD) => {
			setAmountUSD(parseFloat(formattedUSD).toFixed(2));
		});
	}, [network]);

	useEffect(() => {
		const hash = location.hash.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [location.hash, queuedTransactions]);

	const fetchQueuedTransactions = useCallback(async () => {
		try{
			setLoading(true);
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if(!userAddress || !signature || !activeMultisig) {
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
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: queueTransactions, error: queueTransactionsError } = await getQueueTransactions.json() as { data: IQueueItem[], error: string };

				if(queueTransactionsError) {
					setLoading(false);
					return;
				}

				if(queueTransactions){
					setQueuedTransactions(queueTransactions);
					setLoading(false);
				}

			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, network]);

	useEffect(() => {
		fetchQueuedTransactions();
	}, [fetchQueuedTransactions, refetch]);

	if(loading) return <Loader size='large'/>;

	return (
		<>
			{(queuedTransactions && queuedTransactions.length > 0) ? <div className='flex flex-col gap-y-[10px]'>
				{queuedTransactions.map((transaction, index) => {
					return <section id={transaction.callHash} key={index}>
						{/* <h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
							{created_at}
						</h4> */}
						<Transaction
							setQueuedTransactions={setQueuedTransactions}
							date={dayjs(transaction.created_at).format('llll')}
							status={transaction.status}
							approvals={transaction.approvals}
							threshold={multisigAddresses?.find((item) => item.address === activeMultisig)?.threshold || 0}
							callData={transaction.callData}
							callHash={transaction.callHash}
							note={transaction.note || ''}
							setRefetch={setRefetch}
							amountUSD={amountUSD}
							numberOfTransactions={queuedTransactions.length || 0}
						/>
					</section>;
				})}
			</div>: <NoTransactionsQueued/>}
		</>
	);
};

export default Queued;