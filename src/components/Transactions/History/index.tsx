// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
// import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
// import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { ITransaction } from 'src/types';
import Loader from 'src/ui-components/Loader';
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
				const { data: multisigTransactions, error: multisigError } = await getHistoryTransactions(
					multisig.address,
					network,
					10,
					1
				);
				if(multisig.proxy){
					const { data: proxyTransactions, error: proxyError } = await getHistoryTransactions(
						multisig.proxy,
						network,
						10,
						1
					);
					if(multisigTransactions && !proxyError){
						setLoading(false);
						setTransactions(proxyTransactions);
					}
				}

				if(multisigTransactions){
					setLoading(false);
					setTransactions(prev => {
						return [...prev || [], ...multisigTransactions];
					});
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
	}, [activeMultisig, multisig, network, signature, userAddress, refetch]);

	if(loading) return <Loader size='large'/>;

	return (
		<>
			{(transactions && transactions.length > 0)? <div className='flex flex-col gap-y-[10px]'>
				{transactions.sort((a, b) => dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1).map((transaction, index) => {
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