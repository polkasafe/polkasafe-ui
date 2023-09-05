// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalCurrencyContext } from 'src/context/CurrencyContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { usePagination } from 'src/hooks/usePagination';
import { EExportType } from 'src/Screens/Transactions';
import { ITransaction } from 'src/types';
import { OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import Loader from 'src/ui-components/Loader';
import Pagination from 'src/ui-components/Pagination';
import fetchTokenToUSDPrice from 'src/utils/fetchTokentoUSDPrice';

import ExportTransactionsHistory from './ExportTransactionsHistory';
import NoTransactionsHistory from './NoTransactionsHistory';
import Transaction from './Transaction';

interface IHistory{
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	refetch: boolean
	openExportModal: boolean
	setOpenExportModal: React.Dispatch<React.SetStateAction<boolean>>
	setHistoryTxnLength: React.Dispatch<React.SetStateAction<number>>
	exportType: EExportType
}

const History: FC<IHistory> = ({ loading, exportType, setLoading, refetch, openExportModal, setOpenExportModal, setHistoryTxnLength }) => {

	const userAddress = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const { currencyPrice } = useGlobalCurrencyContext();
	const multisig = multisigAddresses.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);
	const { network } = useGlobalApiContext();
	const location = useLocation();
	const { currentPage, setPage, totalDocs, setTotalDocs } = usePagination();
	const [transactions, setTransactions] = useState<ITransaction[]>();
	const [amountUSD, setAmountUSD] = useState<string>('');

	useEffect(() => {
		if(!userAddress || !signature || !activeMultisig) return;

		fetchTokenToUSDPrice(1,network).then((formattedUSD) => {
			setAmountUSD(parseFloat(formattedUSD).toFixed(2));
		});
	}, [activeMultisig, network, signature, userAddress]);

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

				const getMultisigHistoryTransactions = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigHistory`, {
					body: JSON.stringify({
						limit: multisig.proxy ? 5 : 10,
						multisigAddress: multisig?.address,
						page: currentPage
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});
				const { data: { transactions: multisigTransactions, count: multisigTransactionsCount }, error: multisigError } = await getMultisigHistoryTransactions.json() as { data: { transactions: ITransaction[], count: number}, error: string };
				if(multisig.proxy){
					const getProxyHistoryTransactions = await fetch(`${FIREBASE_FUNCTIONS_URL}/getMultisigHistory`, {
						body: JSON.stringify({
							limit: 10 - multisigTransactions.length,
							multisigAddress: multisig.proxy,
							page: currentPage
						}),
						headers: firebaseFunctionsHeader(network),
						method: 'POST'
					});
					const { data: { transactions: proxyTransactions, count: proxyTransactionsCount }, error: proxyError } = await getProxyHistoryTransactions.json() as { data: { transactions: ITransaction[], count: number}, error: string };
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
				setLoading(false);
				console.log(error);
			}
		};
		getTransactions();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, multisig, network, signature, userAddress, refetch, currentPage]);

	useEffect(() => {
		if(transactions && transactions?.length > 0) {
			setHistoryTxnLength(transactions?.length);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transactions]);

	const ExportTransactionsModal: FC = () => {
		return (
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenExportModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl capitalize'>Export Transaction History For {exportType}</h3>}
				open={openExportModal}
				className={' w-auto md:min-w-[500px] scale-90'}
			>
				<ExportTransactionsHistory exportType={exportType} historyTxns={transactions?.map(txn => {
					const type: 'Sent' | 'Received' = multisig?.address === txn.from || multisig?.proxy === txn.from ? 'Sent' : 'Received';
					const amount = !isNaN(txn.amount_usd) ? (Number(txn.amount_usd) * Number(currencyPrice)).toFixed(4) : isNaN(Number(amountUSD)) ? '0' : (Number(txn.amount_token) * Number(amountUSD) * Number(currencyPrice)).toFixed(4);
					return ({ amount: type === 'Sent' ? `-${amount}` : amount, callhash: txn.callHash, date: txn.created_at, from: txn.from, network, token: chainProperties[network].tokenSymbol });
				})} onCancel={() => setOpenExportModal(false)}/>
			</Modal>
		);
	};

	if(loading) return <Loader size='large'/>;

	return (
		<>
			<ExportTransactionsModal/>
			{
				(transactions && transactions.length > 0) ?
					<div className='flex flex-col gap-y-[10px] mb-2 h-[790px] overflow-auto pr-1'>
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