// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
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
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
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
			if(!userAddress || !signature || !multisig || !activeMultisig) {
				console.log('ERROR');
				return;
			}
			setLoading(true);
			try{
				let data:any = [];
				let docs:number = 0;
				const { data: multisigTransactions, error: multisigError, count:multisigTransactionsCount } = await getHistoryTransactions(
					multisig.address,
					network,
					multisig.proxy ? 5 : 10,
					currentPage
				);
				if(multisig.proxy){
					const { data: proxyTransactions, error: proxyError, count:proxyTransactionsCount } = await getHistoryTransactions(
						multisig.proxy,
						network,
						10 - multisigTransactions.length,
						currentPage
					);
					if(proxyTransactions && !proxyError){
						setLoading(false);
						data = proxyTransactions;
						docs = proxyTransactionsCount;
					}
				}

				if(multisigTransactions){
					setLoading(false);
					data = [...data, ...multisigTransactions];
					setTransactions(data);
					docs = docs + multisigTransactionsCount;
					setTotalDocs(docs);
				}
				if(multisigError){
					setLoading(false);
					console.log('Error in Fetching Transactions: ', multisigError);
				}
			} catch (error) {
				console.log(error);
			}
		};
		getTransactions();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, multisig, network, signature, userAddress, refetch, currentPage]);

	if(loading) return <Loader size='large'/>;

	return (
		<>
			{
				(transactions && transactions.length > 0) ?
					<div className='flex flex-col gap-y-[10px] mb-2'>
						{transactions.sort((a, b) => dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1).map((transaction, index) => {
							return <section id={transaction.callHash} key={index}>
								{/* <h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
									{created_at}
								</h4> */}
								<Transaction {...transaction} />
							</section>;
						})}
					</div>
					:
					<NoTransactionsHistory/>
			}
			{totalDocs && totalDocs > 10 &&
				<div className='flex justify-center'>
					<Pagination
						className='self-end'
						currentPage={currentPage}
						defaultPageSize={2}
						setPage={setPage}
						totalDocs={totalDocs || 1}
					/>
				</div>}
		</>
	);
};

export default History;