// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { usePagination } from 'src/hooks/usePagination';
// import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
// import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { ITransaction } from 'src/types';
import Loader from 'src/ui-components/Loader';
import Pagination from 'src/ui-components/Pagination';
import getHistoryTransactions from 'src/utils/getHistoryTransactions';

import NoTransactionsHistory from './NoTransactionsHistory';
import Transaction from './Transaction';

interface IHistory{
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	refetch: boolean
}

const History: FC<IHistory> = ({ loading, setLoading, refetch }) => {

	const userAddress = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');
	const { activeMultisig } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const location = useLocation();
	const { currentPage, setPage, totalDocs, setTotalDocs } = usePagination();
	const [transactions, setTransactions] = useState<ITransaction[]>();
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
			try{
				const { count, data, error } = await getHistoryTransactions(
					activeMultisig,
					network,
					10,
					currentPage
				);
				if(error){
					setLoading(false);
					console.log('Error in Fetching Transactions: ', error);
				}
				if(data){
					setLoading(false);
					setTransactions(data);
					setTotalDocs(count);
				}
			} catch (error) {
				console.log(error);
			}
		};
		getTransactions();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, network, signature, userAddress, refetch, currentPage]);

	if(loading) return <Loader size='large'/>;

	return (
		<div className='flex flex-col h-[calc(100%-50px)] justify-between'>
			{(transactions && transactions.length > 0)? <div className='flex flex-col gap-y-[10px]'>
				<>
					{transactions.map((transaction, index) => {
						return <section id={transaction.callHash} key={index}>
							{/* <h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
							{created_at}
						</h4> */}
							<Transaction {...transaction} />
						</section>;
					})}
				</>
			</div>: <NoTransactionsHistory/>}
			{totalDocs && totalDocs > 10 && <Pagination
				className='self-end'
				currentPage={currentPage}
				defaultPageSize={10}
				setPage={setPage}
				totalDocs={totalDocs}
			/>}
		</div>
	);
};

export default History;