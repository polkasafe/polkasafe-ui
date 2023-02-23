// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import Filter from 'src/components/Transactions/Filter';
import History, { ITransactions } from 'src/components/Transactions/History';
import Queued from 'src/components/Transactions/Queued';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import getNetwork from 'src/utils/getNetwork';

enum ETab {
	QUEUE,
	HISTORY
}

const Transactions = () => {
	const userAddress = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');
	const { activeMultisig } = useGlobalUserDetailsContext();

	const [transactions, setTransactions] = useState<ITransactions[]>();

	useEffect(() => {
		const getTransactions = async () => {
			if(!userAddress || !signature || !activeMultisig) {
				console.log('ERROR');
				return;
			}
			const addAddressRes = await fetch(`${process.env.REACT_APP_FIREBASE_URL}/getTransactionsForMultisig`, {
				body: JSON.stringify({
					limit: 10,
					multisigAddress: activeMultisig,
					network: getNetwork(),
					page: 1
				}),
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'x-address': userAddress,
					'x-signature': signature
				},
				method: 'POST'
			});

			const { data, error } = await addAddressRes.json();
			if(error){
				console.log('Error in Fetching Transactions: ', error);
			}
			if(data){
				setTransactions(data);
			}
		};
		getTransactions();
	}, [activeMultisig, signature, userAddress]);
	const [tab, setTab] = useState(ETab.QUEUE);
	return (
		<>
			<div
				className='bg-bg-main rounded-xl p-[20.5px]'
			>
				<div
					className='flex items-center'
				>
					<button
						onClick={() => setTab(ETab.QUEUE)}
						className={classNames(
							'rounded-lg p-3 font-medium text-sm leading-[15px] w-[100px] text-white',
							{
								'text-primary bg-highlight': tab === ETab.QUEUE
							}
						)}
					>
						Queue
					</button>
					<button
						onClick={() => setTab(ETab.HISTORY)}
						className={classNames(
							'rounded-lg p-3 font-medium text-sm leading-[15px] w-[100px] text-white',
							{
								'text-primary bg-highlight': tab === ETab.HISTORY
							}
						)}
					>
						History
					</button>
					<Filter />
				</div>
				{
					tab === ETab.HISTORY?
						<History transactionsHistory={transactions} />
						:<Queued transactionsQueued={transactions} />
				}
			</div>
		</>
	);
};

export default Transactions;