// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useEffect, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IHistoryTransaction } from 'src/types';
import Loader from 'src/ui-components/Loader';

import NoTransactionsHistory from './NoTransactionsHistory';
import Transaction from './Transaction';

const History: FC = () => {

	const userAddress = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');
	const { activeMultisig } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();

	const [transactions, setTransactions] = useState<IHistoryTransaction[]>();
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const getTransactions = async () => {
			if(!userAddress || !signature || !activeMultisig) {
				console.log('ERROR');
				return;
			}
			setLoading(true);
			const getTransactionsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getTransactionsForMultisig`, {
				body: JSON.stringify({
					limit: 10,
					multisigAddress: activeMultisig,
					network,
					page: 1
				}),
				headers: firebaseFunctionsHeader(),
				method: 'POST'
			});

			const { data, error } = await getTransactionsRes.json();
			if(error){
				setLoading(false);
				console.log('Error in Fetching Transactions: ', error);
			}
			if(data){
				console.log(data);
				setLoading(false);
				setTransactions(data);
			}
		};
		getTransactions();
	}, [activeMultisig, network, signature, userAddress]);

	if(loading) return <Loader size='large'/>;

	return (
		<>
			{(transactions && transactions.length > 0)? <div className='flex flex-col gap-y-[10px]'>
				{transactions.map((transaction, index) => {
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