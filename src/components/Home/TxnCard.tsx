// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReloadOutlined } from '@ant-design/icons';
import BN from 'bn.js';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { IQueueItem,ITransaction } from 'src/types';
import { RightArrowOutlined } from 'src/ui-components/CustomIcons';
import Loader from 'src/ui-components/Loader';
import decodeCallData from 'src/utils/decodeCallData';
import fetchTokenToUSDPrice from 'src/utils/fetchTokentoUSDPrice';
import formatBnBalance from 'src/utils/formatBnBalance';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getHistoryTransactions from 'src/utils/getHistoryTransactions';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import shortenAddress from 'src/utils/shortenAddress';

import BottomLeftArrow from '../../assets/icons/bottom-left-arrow.svg';
import TopRightArrow from '../../assets/icons/top-right-arrow.svg';

const TxnCard = ({ newTxn }: { newTxn: boolean }) => {
	const userAddress = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');
	const { activeMultisig, addressBook } = useGlobalUserDetailsContext();
	const { api, apiReady, network } = useGlobalApiContext();

	const [transactions, setTransactions] = useState<ITransaction[]>();
	const [queuedTransactions, setQueuedTransactions] = useState<IQueueItem[]>([]);

	const [historyLoading, setHistoryLoading] = useState<boolean>(false);
	const [queueLoading, setQueueLoading] = useState<boolean>(false);

	const [amountUSD, setAmountUSD] = useState<string>('');

	useEffect(() => {
		const getTransactions = async () => {
			if(!userAddress || !signature || !activeMultisig) return;

			setHistoryLoading(true);
			try{
				const { data, error } = await getHistoryTransactions(
					activeMultisig,
					network,
					10,
					1
				);
				if(error){
					setHistoryLoading(false);
					console.log('Error in Fetching Transactions: ', error);
				}
				if(data){
					setHistoryLoading(false);
					setTransactions(data);
				}
			} catch (error) {
				console.log(error);
				setHistoryLoading(false);
			}
		};
		getTransactions();
	}, [activeMultisig, network, signature, userAddress, newTxn]);

	useEffect(() => {
		const getQueue = async () => {
			try{
				setQueueLoading(true);
				const userAddress = localStorage.getItem('address');
				const signature = localStorage.getItem('signature');

				if(!userAddress || !signature || !activeMultisig) {
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
						headers: firebaseFunctionsHeader(network),
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
	}, [activeMultisig, network, newTxn]);

	useEffect(() => {
		if(!userAddress || !signature || !activeMultisig) return;

		fetchTokenToUSDPrice(1,network).then((formattedUSD) => {
			setAmountUSD(parseFloat(formattedUSD).toFixed(2));
		});
	}, [activeMultisig, network, signature, userAddress]);

	return (
		<div>
			<div className="grid grid-cols-12 gap-4 my-3 grid-row-2 lg:grid-row-1">
				{/* Txn Queue */}
				<div className='col-start-1 col-end-13 md:col-end-7'>
					<div className="flex justify-between flex-row w-full">
						<h2 className="text-xl font-bold text-white">Transaction Queue</h2>
						<Link to="/transactions?tab=Queue" className="flex items-center justify-center text-primary cursor-pointer">
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined/>
						</Link>
					</div>

					<div className="flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg mt-2 h-60 overflow-auto">
						<h1 className="text-primary text-md mb-4">Pending Transactions</h1>
						{!queueLoading && api && apiReady ? (queuedTransactions && queuedTransactions.length > 0) ?
							queuedTransactions.filter((_, i) => i < 10).map((transaction, i) => {
								let decodedCallData = null;

								if(transaction.callData) {
									const { data, error } = decodeCallData(transaction.callData, api) as { data: any, error: any };
									if(!error && data) {
										decodedCallData = data.extrinsicCall?.toJSON();
									}
								}

								const destSubstrateAddress = decodedCallData ? getSubstrateAddress(decodedCallData?.args?.dest?.id) : '';
								const destAddressName = addressBook.find((address) => address.address === destSubstrateAddress)?.name;

								const toText = decodedCallData && destSubstrateAddress ? destAddressName :
									(shortenAddress( decodedCallData ? String(getEncodedAddress(decodedCallData?.args?.dest?.id, network)) : ''));

								return (
									<Link to={`/transactions?tab=Queue#${transaction.callHash}`} key={i} className="flex items-center justify-between pb-2 mb-2">
										<div className="flex items-center justify-between">
											<div className='bg-waiting bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'><ReloadOutlined className='text-waiting' /></div>
											<div className='ml-3'>
												<h1 className='text-md text-white'>
													{ decodedCallData ? <span title={destSubstrateAddress || ''}>To: {toText}</span> : <span>Txn: {shortenAddress(transaction.callHash)}</span>}
												</h1>
												<p className='text-white text-xs'>In Process...</p>
											</div>
										</div>
										<div>
											<h1 className='text-md text-white'>- {decodedCallData ? formatBnBalance(new BN(decodedCallData?.args?.value), { numberAfterComma: 3, withUnit: true }, network): `? ${chainProperties[network].tokenSymbol}`}</h1>
											<p className='text-white text-right text-xs'>{(Number(amountUSD) * Number(decodedCallData?.args?.value)).toFixed(2) || '0'} USD</p>
										</div>
									</Link>
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
						<Link to="/transactions?tab=History" className="flex items-center justify-center text-primary cursor-pointer">
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined/>
						</Link>
					</div>
					<div className="flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg mt-2 h-60 overflow-auto">
						<h1 className="text-primary text-md mb-4">Completed Transactions</h1>

						{!historyLoading ? (transactions && transactions.length > 0) ?
							transactions.filter((_, i) => i < 10).map((transaction, i) => {
								const sent = transaction.from === activeMultisig;

								return (
									<Link to={`/transactions?tab=History#${transaction.callHash}`} key={i} className="flex items-center justify-between pb-2 mb-2">
										<div className="flex items-center justify-between">
											<div className={`${sent ? 'bg-failure' : 'bg-success'} bg-opacity-10 rounded-lg p-2 mr-3 h-[38px] w-[38px] flex items-center justify-center`}><img src={sent ? TopRightArrow : BottomLeftArrow} alt="send"/></div>
											<div>
												{sent ?
													<h1 className='text-md text-white'>To: {addressBook.find((address) => address.address === getSubstrateAddress(transaction.to))?.name || shortenAddress(getEncodedAddress(transaction.to, network) || '')}</h1>
													:
													<h1 className='text-md text-white'>From: {addressBook.find((address) => address.address === getSubstrateAddress(transaction.from))?.name || shortenAddress(getEncodedAddress(transaction.from, network) || '')}</h1>
												}
												<p className='text-text_secondary text-xs'>{dayjs(transaction.created_at).format('D-MM-YY [at] HH:mm')}</p>
											</div>
										</div>
										<div>
											{sent ? <h1 className='text-md text-failure'>-{transaction.amount_token} {transaction.token}</h1>
												: <h1 className='text-md text-success'>+{transaction.amount_token} {transaction.token}</h1>}
											<p className='text-text_secondary text-right text-xs'>{transaction.amount_usd} USD</p>
										</div>
									</Link>
								);
							}) :
							<div className='flex justify-center items-center h-full'><p className='font-normal text-sm leading-[15px] text-text_secondary'>No history transactions</p></div>
							:
							<Loader />
						}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TxnCard;
