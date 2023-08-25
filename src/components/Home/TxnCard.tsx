// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ArrowRightOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import noTransactionsHistory from 'src/assets/icons/no-transaction.svg';
import noTransactionsQueued from 'src/assets/icons/no-transactions-queued.svg';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalCurrencyContext } from 'src/context/CurrencyContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { currencyProperties } from 'src/global/currencyConstants';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { IQueueItem,ITransaction } from 'src/types';
import { ArrowUpRightIcon, RightArrowOutlined } from 'src/ui-components/CustomIcons';
import Loader from 'src/ui-components/Loader';
import decodeCallData from 'src/utils/decodeCallData';
import fetchTokenToUSDPrice from 'src/utils/fetchTokentoUSDPrice';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';
import parseDecodedValue from 'src/utils/parseDecodedValue';
import shortenAddress from 'src/utils/shortenAddress';

import BottomLeftArrow from '../../assets/icons/bottom-left-arrow.svg';
import TopRightArrow from '../../assets/icons/top-right-arrow.svg';

const TxnCard = ({ newTxn, setProxyInProcess }: { newTxn: boolean, setProxyInProcess: React.Dispatch<React.SetStateAction<boolean>>}) => {
	const userAddress = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');
	const { activeMultisig, addressBook, multisigAddresses } = useGlobalUserDetailsContext();
	const { api, apiReady, network } = useGlobalApiContext();
	const { currency, currencyPrice } = useGlobalCurrencyContext();

	const [transactions, setTransactions] = useState<ITransaction[]>();
	const [queuedTransactions, setQueuedTransactions] = useState<IQueueItem[]>([]);

	const [historyLoading, setHistoryLoading] = useState<boolean>(false);
	const [queueLoading, setQueueLoading] = useState<boolean>(false);

	const [amountUSD, setAmountUSD] = useState<string>('');

	const multisig = multisigAddresses?.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	useEffect(() => {
		if(!api || !apiReady) return;
		if(queuedTransactions.some((transaction) => {
			let decodedCallData = null;
			if(transaction.callData) {
				const { data, error } = decodeCallData(transaction.callData, api) as { data: any, error: any };
				if(!error && data) {
					decodedCallData = data.extrinsicCall?.toJSON();
				}
			}
			return decodedCallData && decodedCallData?.args?.proxy_type;
		})){
			setProxyInProcess(true);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, queuedTransactions]);

	useEffect(() => {
		const getTransactions = async () => {
			if(!userAddress || !signature || !activeMultisig) return;

			setHistoryLoading(true);
			try{
				const getMultisigHistoryTransactions = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigHistory`, {
					body: JSON.stringify({
						limit: 10,
						multisigAddress: activeMultisig,
						page: 1
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});
				const { data: multisigTransactions, error: multisigError } = await getMultisigHistoryTransactions.json() as { data: ITransaction[], error: string };
				console.log(multisigTransactions);
				if(multisigError){
					setHistoryLoading(false);
					console.log('Error in Fetching Transactions: ', multisigError);
				}
				if(multisigTransactions){
					setHistoryLoading(false);
					setTransactions(multisigTransactions);
				}
			} catch (error) {
				console.log(error);
				setHistoryLoading(false);
			}
		};
		getTransactions();
	}, [activeMultisig, network, signature, userAddress, newTxn, currency]);

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
							multisigAddress: multisig?.address,
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
	}, [activeMultisig, multisig?.address, network, newTxn]);

	useEffect(() => {
		if(!userAddress || !signature || !activeMultisig) return;

		fetchTokenToUSDPrice(1,network).then((formattedUSD) => {
			setAmountUSD(parseFloat(formattedUSD).toFixed(2));
		});
	}, [activeMultisig, network, signature, userAddress]);

	return (
		<div>
			<div className="grid grid-cols-12 gap-4 grid-row-2 lg:grid-row-1">
				{/* Txn Queue */}
				<div className='col-start-1 col-end-13 md:col-end-7'>
					<div className="flex justify-between flex-row w-full mb-2">
						<h2 className="text-base font-bold text-white">Transaction Queue</h2>
						<Link to="/transactions?tab=Queue" className="flex items-center justify-center text-primary cursor-pointer">
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined/>
						</Link>
					</div>

					<div className="flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg h-60 overflow-auto scale-90 w-[111%] origin-top-left">
						<h1 className="text-primary text-sm mb-4">Pending Transactions</h1>
						{!queueLoading && api && apiReady ? (queuedTransactions && queuedTransactions.length > 0) ?
							queuedTransactions.filter((_, i) => i < 10).map((transaction, i) => {
								let decodedCallData = null;
								let callDataFunc = null;

								if(transaction.callData) {
									const { data, error } = decodeCallData(transaction.callData, api) as { data: any, error: any };
									if(!error && data) {
										decodedCallData = data.extrinsicCall?.toJSON();
										callDataFunc = data.extrinsicFn;
									}
								}

								const isProxyApproval = decodedCallData && (decodedCallData?.args?.proxy_type || decodedCallData?.args?.call?.args?.delegate?.id);

								const customTx = decodedCallData?.args && !decodedCallData?.args?.dest && !decodedCallData?.args?.call?.args?.dest && !decodedCallData?.args?.calls?.[0]?.args?.dest && !decodedCallData?.args?.call?.args?.calls?.[0]?.args?.dest;

								const destSubstrateAddress = decodedCallData && (decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id) ? getSubstrateAddress(decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id) : '';
								const destAddressName = addressBook?.find((address) => getSubstrateAddress(address.address) === destSubstrateAddress)?.name;

								const toText = decodedCallData && destSubstrateAddress && destAddressName ? destAddressName :
									(shortenAddress( decodedCallData && (decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id) ? String(getEncodedAddress(decodedCallData?.args?.dest?.id || decodedCallData?.args?.call?.args?.dest?.id, network)) : ''));

								let batchCallRecipients: string[] = [];
								if(decodedCallData && decodedCallData?.args?.calls){
									batchCallRecipients = decodedCallData?.args?.calls?.map((call: any) => {
										const dest = call?.args?.dest?.id;
										return addressBook.find((a) => getSubstrateAddress(a.address) === getSubstrateAddress(dest))?.name || shortenAddress(getEncodedAddress(dest, network) || '');
									});
								}
								else if(decodedCallData && decodedCallData?.args?.call?.args?.calls){
									batchCallRecipients = decodedCallData?.args?.call?.args?.calls?.map((call: any) => {
										const dest = call?.args?.dest?.id;
										return addressBook.find((a) => getSubstrateAddress(a.address) === getSubstrateAddress(dest))?.name || shortenAddress(getEncodedAddress(dest, network) || '');
									});
								}
								return (
									<Link to={`/transactions?tab=Queue#${transaction.callHash}`} key={i} className="flex items-center pb-2 mb-2">
										<div className="flex flex-1 items-center">
											{isProxyApproval ?
												<div className='bg-[#FF79F2] text-[#FF79F2] bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'>
													<ArrowUpRightIcon />
												</div>
												:
												<div className='bg-waiting text-waiting bg-opacity-10 rounded-lg h-[38px] w-[38px] flex items-center justify-center'>
													<ReloadOutlined />
												</div>}
											<div className='ml-3'>
												<h1 className='text-md text-white truncate'>
													{ decodedCallData && !isProxyApproval && !customTx ? <span>To: {batchCallRecipients.length ? batchCallRecipients.map((a, i) => `${a}${i !== batchCallRecipients?.length - 1 ? ', ' : ''}`) : toText}</span> : customTx ? <span>Txn: {callDataFunc?.section}.{callDataFunc?.method}</span> : <span>Txn: {shortenAddress(transaction.callHash)}</span>}
												</h1>
												<p className='text-text_secondary text-xs'>{isProxyApproval ? 'Proxy Creation request in Process...' : 'In Process...'}</p>
											</div>
										</div>
										{!isProxyApproval && !customTx &&
										Number(transaction?.totalAmount) ?
											<div>
												<h1 className='text-md text-white'>- {transaction.totalAmount} {chainProperties[network].tokenSymbol}</h1>
												{!isNaN(Number(amountUSD)) && <p className='text-text_secondary text-right text-xs'>{(Number(amountUSD) * Number(transaction.totalAmount) * Number(currencyPrice)).toFixed(2)} {currencyProperties[currency].symbol}</p>}
											</div>
											:
											<div>
												<h1 className='text-md text-white'>- {decodedCallData && (decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value) ? parseDecodedValue({ network, value: String(decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value), withUnit: true }) : `? ${chainProperties[network].tokenSymbol}`}</h1>
												{!isNaN(Number(amountUSD)) && (decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value) && <p className='text-white text-right text-xs'>{(Number(amountUSD) * Number(currencyPrice) * Number(parseDecodedValue({ network, value: String(decodedCallData?.args?.value || decodedCallData?.args?.call?.args?.value), withUnit: false }))).toFixed(2)} {currencyProperties[currency].symbol}</p>}
											</div>
										}
										<div className='flex justify-center items-center h-full px-2 text-text_secondary'>
											<ArrowRightOutlined/>
										</div>
									</Link>
								);})
							:
							<div className={'flex flex-col gap-y-5 items-center justify-center'}>
								<img className={'block w-[250px] h-[140px]'} src={noTransactionsQueued} alt="Zero transaction icon" />
								<p className='font-normal text-sm leading-[15px] text-text_secondary'>No past transactions</p>
							</div>
							:
							<Loader />}
					</div>
				</div>

				{/* Txn History */}
				<div className='md:col-start-7 col-start-1 col-end-13'>
					<div className="flex justify-between flex-row w-full mb-2">
						<h2 className="text-base font-bold text-white">Transaction History</h2>
						<Link to="/transactions?tab=History" className="flex items-center justify-center text-primary cursor-pointer">
							<p className='mx-2 text-primary text-sm'>View All</p>
							<RightArrowOutlined/>
						</Link>
					</div>
					<div className="flex flex-col bg-bg-main px-5 py-3 shadow-lg rounded-lg h-60 scale-90 w-[111%] origin-top-left overflow-auto">
						<h1 className="text-primary text-sm mb-4">Completed Transactions</h1>

						{!historyLoading ? (transactions && transactions.length > 0) ?
							transactions.filter((_, i) => i < 10).map((transaction, i) => {
								const sent = transaction.from === activeMultisig;

								return (
									<Link to={`/transactions?tab=History#${transaction.callHash}`} key={i} className="flex items-center justify-between pb-2 mb-2">
										<div className="flex items-center justify-between">
											<div className={`${sent ? 'bg-failure' : 'bg-success'} bg-opacity-10 rounded-lg p-2 mr-3 h-[38px] w-[38px] flex items-center justify-center`}><img src={sent ? TopRightArrow : BottomLeftArrow} alt="send"/></div>
											<div>
												{sent ?
													<h1 className='text-md text-white'>To: {addressBook?.find((address) => address.address === getEncodedAddress(String(transaction.to), network))?.name || shortenAddress(getEncodedAddress(String(transaction.to), network) || '')}</h1>
													:
													<h1 className='text-md text-white'>From: {addressBook?.find((address) => address.address === getEncodedAddress(transaction.from, network))?.name || shortenAddress(getEncodedAddress(transaction.from, network) || '')}</h1>
												}
												<p className='text-text_secondary text-xs'>{dayjs(transaction.created_at).format('D-MM-YY [at] HH:mm')}</p>
											</div>
										</div>
										<div>
											{sent ? <h1 className='text-md text-failure'>-{transaction.amount_token} {transaction.token}</h1>
												: <h1 className='text-md text-success'>+{transaction.amount_token} {transaction.token}</h1>}
											<p className='text-text_secondary text-right text-xs'>{Number(transaction.amount_usd).toFixed(2)} {currencyProperties[currency].symbol}</p>
										</div>
									</Link>
								);
							}) :
							<div className={'flex flex-col gap-y-5 items-center justify-center'}>
								<img className={'block w-[250px] h-[140px]'} src={noTransactionsHistory} alt="Zero transaction icon" />
								<p className='font-normal text-sm leading-[15px] text-text_secondary'>No past transactions</p>
							</div>
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
