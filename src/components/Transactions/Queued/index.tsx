// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EthersAdapter } from '@safe-global/protocol-kit';
import dayjs from 'dayjs';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalWeb3Context } from 'src/context';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { GnosisSafeService } from 'src/services';
import { IQueueItem } from 'src/types';
import Loader from 'src/ui-components/Loader';
import fetchTokenToUSDPrice from 'src/utils/fetchTokentoUSDPrice';

import NoTransactionsQueued from './NoTransactionsQueued';
import Transaction from './Transaction';

const LocalizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(LocalizedFormat);

interface IQueued{
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	refetch: boolean
	setRefetch: React.Dispatch<React.SetStateAction<boolean>>
}

const Queued: FC<IQueued> = ({ loading, setLoading, refetch, setRefetch }) => {
	const { activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const { web3AuthUser, ethProvider } = useGlobalWeb3Context();

	const [queuedTransactions, setQueuedTransactions] = useState<any[]>([]);
	const location = useLocation();
	const [amountUSD, setAmountUSD] = useState<string>('');
	const multisig = multisigAddresses?.find((item) => item.address === activeMultisig || item.proxy === activeMultisig);

	useEffect(() => {
		fetchTokenToUSDPrice(1,network).then((formattedUSD) => {
			setAmountUSD(parseFloat(formattedUSD).toFixed(2));
		});
	}, [network]);

	useEffect(() => {
		const hash = location.hash.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [location.hash, queuedTransactions]);

	const fetchQueuedTransactions = useCallback(async () => {
		try{
			setLoading(true);

			const { data } = await fetch(`${FIREBASE_FUNCTIONS_URL}/getAllTransaction`, { //@TODO error handling
				headers: {
					'Accept': 'application/json',
					'Acess-Control-Allow-Origin': '*',
					'Content-Type': 'application/json',
					'x-address': web3AuthUser!.accounts[0],
					'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
					'x-signature': localStorage.getItem("signature")!,
					"x-multisig": activeMultisig,
					'x-source': 'polkasafe'
				},
				method: 'GET'
			}).then(res => res.json());

			if(data){
				setQueuedTransactions(data);
				setLoading(false);
			}
		} catch (error){
			console.log('ERROR', error);
			setLoading(false);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeMultisig, network]);

	useEffect(() => {
		fetchQueuedTransactions();
	}, [fetchQueuedTransactions, refetch]);

	if(loading) return <Loader size='large'/>;

	return (
		<>
			{(queuedTransactions && queuedTransactions.length > 0) ? <div className='flex flex-col gap-y-[10px]'>
				{queuedTransactions.map((transaction, index) => {
					
					return <section id={transaction.callHash} key={index}>
						{/* <h4 className='mb-4 text-text_secondary text-xs font-normal leading-[13px] uppercase'>
							{created_at}
						</h4> */}
						<Transaction
							setQueuedTransactions={setQueuedTransactions}
							date={dayjs(transaction.modified).format('llll')}
							status={transaction.isExecuted ? 'Executed' : 'Approval'}
							approvals={transaction.confimations || []}
							threshold={multisig?.threshold || 0}
							callData={transaction.data}
							callHash={transaction.txHash}
							note={transaction.note || ''}
							refetch={() => setRefetch(prev => !prev)}
							amountUSD={amountUSD || '0'}
							numberOfTransactions={queuedTransactions.length || 0}
							notifications={transaction?.notifications || {}}
						/>
					</section>;
				})}
			</div>: <NoTransactionsQueued/>}
		</>
	);
};

export default Queued;