// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReloadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { IHistoryTransaction, IQueueItem } from 'src/types';
import { RightArrowOutlined } from 'src/ui-components/CustomIcons';
import Loader from 'src/ui-components/Loader';
import decodeCallData from 'src/utils/decodeCallData';
import shortenAddress from 'src/utils/shortenAddress';

import BottomLeftArrow from '../../assets/icons/bottom-left-arrow.svg';
import TopRightArrow from '../../assets/icons/top-right-arrow.svg';

const TxnCard = () => {
	const userAddress = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');
	const { activeMultisig, address } = useGlobalUserDetailsContext();
	const { api, apiReady, network } = useGlobalApiContext();

	const [transactions, setTransactions] = useState<IHistoryTransaction[]>();
	const [queuedTransactions, setQueuedTransactions] = useState<IQueueItem[]>([]);

	const [historyLoading, setHistoryLoading] = useState<boolean>(false);
	const [queueLoading, setQueueLoading] = useState<boolean>(false);

	useEffect(() => {
		const getTransactions = async () => {
			if(!userAddress || !signature || !activeMultisig) {
				console.log('ERROR');
				return;
			}
			setHistoryLoading(true);
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
				setHistoryLoading(false);
				console.log('Error in Fetching Transactions: ', error);
			}
			if(data){
				setHistoryLoading(false);
				setTransactions(data);
			}
		};
		getTransactions();
	}, [activeMultisig, network, signature, userAddress]);

	useEffect(() => {
		const getQueue = async () => {
			try{
				setQueueLoading(true);
				const userAddress = localStorage.getItem('address');
				const signature = localStorage.getItem('signature');

				if(!userAddress || !signature) {
					console.log('ERROR');
					setQueueLoading(false);
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
						headers: firebaseFunctionsHeader(),
						method: 'POST'
					});

					const { data: queueTransactions, error: queueTransactionsError } = await getQueueTransactions.json() as { data: IQueueItem[], error: string };

					if(queueTransactionsError) {
						setQueueLoading(false);
						return;
					}

					if(queueTransactions){
						setQueuedTransactions(queueTransactions);
						setQueueLoading(false);
					}

				}
			} catch (error){
				console.log('ERROR', error);
				setQueueLoading(false);
			}
		};
		getQueue();
	}, [activeMultisig, network]);

	return (
		<div>
			<div className="grid grid-cols-12 gap-4 my-3 grid-row-2 lg:grid-row-1">
				{/* Txn Queue */}
				<div className='col-start-1 col-end-13 md:col-end-7'>
					<div className="flex justify-between flex-row w-full">
						<h2 className="text-xl font-bold text-white">Transaction Queue</h2>
						<Link to="/transactions" className="flex items-center justify-center text-primary cursor-pointer">
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined/>
						</Link>
					</div>
					<div className="flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg mt-2 h-60 overflow-auto">
						<h1 className="text-primary text-md mb-4">Pending Transactions</h1>
						{!queueLoading ? (queuedTransactions && queuedTransactions.length > 0) ?
							queuedTransactions.map((transaction, i) => {
								if(!api || !apiReady) return;
								const { data, error } = decodeCallData(transaction.callData, api) as { data: any, error: any };
								if(error || !data) return;
								const res = data.extrinsicCall?.toJSON();
								if(!res || !res.args || !res.args?.value){
									return;
								}
								const amount = res.args.value;
								return (
									<div key={i} className="flex items-center justify-between pb-2 mb-2">
										<div className="flex items-center justify-between">
											<div className='bg-waiting bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'><ReloadOutlined className='text-waiting' /></div>
											<div className='ml-3'>
												<h1 className='text-md text-white'>Txn: {shortenAddress(transaction.callHash)}</h1>
												<p className='text-white text-xs'>In Process...</p>
											</div>
										</div>
										<div>
											<h1 className='text-md text-white'>-{amount} DOT</h1>
											{/* <p className='text-white text-right text-xs'>5173.42 USD</p> */}
										</div>
									</div>
								);})
							:
							<div className='flex justify-center items-center h-full'><p className='font-normal text-sm leading-[15px] text-text_secondary'>No queued transactions</p></div>
							:
							<Loader />}
					</div>
				</div>
				{/* Txn History */}
				<div className='md:col-start-7 col-start-1 col-end-13'>
					<div className="flex justify-between flex-row w-full">
						<h2 className="text-xl font-bold text-white">Transaction History</h2>
						<Link to="/transactions" className="flex items-center justify-center text-primary cursor-pointer">
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined/>
						</Link>
					</div>
					<div className='bg-bg-main p-3 shadow-lg rounded-lg mt-2 h-60 overflow-auto'>
						<h1 className="text-primary text-md mb-4">Completed Transactions</h1>

						{!historyLoading ? (transactions && transactions.length > 0) ?
							transactions.map((transaction, i) => {
								const sent = transaction.from === address;
								return (
									<div key={i} className="flex items-center justify-between pb-2 mb-2">
										<div className="flex items-center justify-between">
											<div className={`${sent ? 'bg-failure' : 'bg-success'} bg-opacity-10 rounded-lg p-2 mr-3 h-[38px] w-[38px] flex items-center justify-center`}><img src={sent ? TopRightArrow : BottomLeftArrow} alt="send"/></div>
											<div>
												<h1 className='text-md text-white'>Txn: {shortenAddress(transaction.callHash)}</h1>
												{/* <p className='text-text_secondary text-xs'>{transaction.created_at.getTime()}</p> */}
											</div>
										</div>
										<div>
											{sent ? <h1 className='text-md text-failure'>-{transaction.amount_token} {transaction.token}</h1>
												: <h1 className='text-md text-success'>+{transaction.amount_token} {transaction.token}</h1>}
											<p className='text-text_secondary text-right text-xs'>{transaction.amount_usd} USD</p>
										</div>
									</div>
								);
							}) :
							<div className='flex justify-center items-center h-full'><p className='font-normal text-sm leading-[15px] text-text_secondary'>No history transactions</p></div>
							:
							<Loader />}
						{/*TODO: Empty state */}
						{/* <div className="flex flex-col items-center justify-center mt-5">
							<img className='w-[150px] mt-3' src={emptyTxHistory} alt="tx"/>
							<p className='text-text_secondary my-2'>No past transactions</p>
						</div> */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TxnCard;
