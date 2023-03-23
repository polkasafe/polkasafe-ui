// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import classNames from 'classnames';
import React, { useEffect,useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import Filter from 'src/components/Transactions/Filter';
import History from 'src/components/Transactions/History';
import Queued from 'src/components/Transactions/Queued';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { ExternalLinkIcon } from 'src/ui-components/CustomIcons';

enum ETab {
	QUEUE,
	HISTORY
}

const Transactions = () => {
	const [tab, setTab] = useState(ETab.QUEUE);
	const location = useLocation();
	const { address } = useGlobalUserDetailsContext();
	useEffect(() => {
		const search = location.search.split('=')[1];
		if(search === 'History'){
			setTab(ETab.HISTORY);
		}
		if(search === 'Queue'){
			setTab(ETab.QUEUE);
		}
	}, [location.search]);

	return (
		<>
			<div
				className='bg-bg-main rounded-xl p-[20.5px] h-full'
			>
				{address ?
					<>
						<div
							className='flex items-center mb-4'
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
							{/* {tab !== ETab.QUEUE && <Filter />} */}
						</div>
						{
							tab === ETab.HISTORY?
								<History />
								:<Queued />
						}
					</>
					:
					<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
						<Link to='/'><span>Please Login</span> <ExternalLinkIcon /></Link>
					</div>}
			</div>
		</>
	);
};

export default Transactions;