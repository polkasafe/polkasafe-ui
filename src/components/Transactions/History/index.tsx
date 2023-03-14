// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { ITransaction } from 'src/types';
import Loader from 'src/ui-components/Loader';

import NoTransactionsHistory from './NoTransactionsHistory';
import Transaction from './Transaction';

const History: FC = () => {

	const userAddress = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');
	const { activeMultisig } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const location = useLocation();

	const [transactions, setTransactions] = useState<ITransaction[]>();
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const hash = location.hash.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [location.hash, transactions]);

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
					return <section id={transaction.callHash} key={index}>
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