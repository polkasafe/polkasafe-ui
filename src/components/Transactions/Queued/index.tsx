// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import Loader from 'src/ui-components/Loader';

import NoTransactionsQueued from './NoTransactionsQueued';
import Transaction from './Transaction';

const LocalizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(LocalizedFormat);

interface IQueued {
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	refetch: boolean
	setRefetch: React.Dispatch<React.SetStateAction<boolean>>
}

const Queued: FC<IQueued> = ({ loading, refetch, setRefetch }) => {
	const { activeMultisig, multisigAddresses, activeMultisigTxs } = useGlobalUserDetailsContext();
	const [queuedTransactions, setQueuedTransactions] = useState<any[]>([]);
	const location = useLocation();
	const multisig = multisigAddresses?.find((item: any) => item.address === activeMultisig || item.proxy === activeMultisig);

	useEffect(() => {
		const hash = location.hash.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [location.hash, queuedTransactions]);

	useEffect(() => {
		const queue = activeMultisigTxs?.filter((item: any) => (item.executed !== true && item.type !== 'fund')) || [];
		setQueuedTransactions(queue);
	}, [activeMultisigTxs, refetch]);

	if (loading) return <Loader size='large' />;

	return (
		<>
			{(queuedTransactions && queuedTransactions.length > 0) ? <div className='flex flex-col gap-y-[10px]'>
				{queuedTransactions.map((transaction, index) => {

					return <section id={transaction.callHash} key={index}>
						<Transaction
							value={transaction.amount_token}
							setQueuedTransactions={setQueuedTransactions}
							date={dayjs(transaction.modified).format('llll')}
							status={transaction.isExecuted ? 'Executed' : 'Approval'}
							approvals={transaction.signatures ? transaction.signatures.map((item: any) => item.address) : []}
							threshold={multisig?.threshold || 0}
							callData={transaction.data}
							callHash={transaction.txHash}
							note={transaction.note || ''}
							refetch={() => setRefetch(prev => !prev)}
							amountUSD={'0'}
							numberOfTransactions={queuedTransactions.length || 0}
							notifications={transaction?.notifications || {}}
						/>
					</section>;
				})}
			</div> : <NoTransactionsQueued />}
		</>
	);
};

export default Queued;