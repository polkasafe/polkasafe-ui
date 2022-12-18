// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Tabs } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import RejectTransaction from 'src/components/Transactions/RejectTransaction';
import TransactionsCard from 'src/components/Transactions/TransactionsCard';
import ContentHeader from 'src/ui-components/ContentHeader';
import ContentWrapper from 'src/ui-components/ContentWrapper';

import History, { ITransactionsHistory } from './History';
import Queued from './Queued';

const ETab =  {
	HISTORY: 'HISTORY',
	QUEUED: 'QUEUED'
};

const transactionsHistory: ITransactionsHistory[] = [
	{
		date: 'AUG 10, 2022',
		transactions: [
			{
				amount: '10,000',
				amountType: 'USDC',
				no: 3,
				status: 'Success',
				time: '12:43 PM',
				type: 'Sent'
			},
			{
				amount: '10,000',
				amountType: 'USDC',
				no: 2,
				status: 'Success',
				time: '12:43 PM',
				type: 'Sent'
			}
		]
	},
	{
		date: 'AUG 04, 2022',
		transactions: [
			{
				amount: '10,000',
				amountType: 'USDC',
				no: 2,
				status: 'Success',
				time: '12:43 PM',
				type: 'Received'
			}
		]
	},
	{
		date: 'JUL 10, 2022',
		transactions: [
			{
				amount: '10,000',
				amountType: 'USDC',
				no: 2,
				status: 'Success',
				time: '12:43 PM',
				type: 'Sent'
			}
		]
	}
];

const Transactions = () => {
	const [isReject] = useState(true);
	const [isTransactionInitiated] = useState(false);
	const [tab, setTab] = useState(ETab.QUEUED);
	return (
		<>
			{isTransactionInitiated?<div className='grid md:grid-cols-2 gap-5 lg:gap-10'>
				{isReject?
					<RejectTransaction/>
					:<>
						<div>
							<ContentHeader
								title='Send Funds'
								subTitle={
									<h3 className='ml-2 text-sm font-normal'>
							/Step 1 of 2
									</h3>
								}
								rightElm={
									<span className='font-bold text-base text-blue_primary'>
							Polkadot
									</span>
								}
							/>
							<ContentWrapper>
								<TransactionsCard/>
							</ContentWrapper>
						</div>
						<div>
							<ContentHeader
								title='Send Funds'
								subTitle={
									<h3 className='ml-2 text-sm font-normal'>
							/Step 2 of 2
									</h3>
								}
								rightElm={
									<span className='font-bold text-base text-blue_primary'>
							Polkadot
									</span>
								}
							/>
							<ContentWrapper>
								<TransactionsCard/>
							</ContentWrapper>
						</div>
					</>}
			</div>: <div>
				<ContentHeader
					title='Transaction'
					subTitle={
						<h3 className='ml-2 text-sm font-normal'>
							/ {tab}
						</h3>
					}
					rightElm={
						tab === ETab.HISTORY?
							<span className='font-bold text-base text-blue_primary'>
							Filter
							</span>: null
					}
				/>
				<ContentWrapper>
					<Tabs
						defaultActiveKey={ETab.QUEUED}
						activeKey={tab}
						onChange={(key) => {
							setTab(key);
						}}
						items={[
							{
								children: <Queued transactionsQueued={[]} />,
								key: ETab.QUEUED,
								label: <span className={classNames('font-medium text-sm', {
									'text-blue_secondary': tab !== ETab.QUEUED
								})}>{ETab.QUEUED}</span>
							},
							{
								children: <History transactionsHistory={transactionsHistory} />,
								key: ETab.HISTORY,
								label: <span className={classNames('font-medium text-sm', {
									'text-blue_secondary': tab !== ETab.HISTORY
								})}>{ETab.HISTORY}</span>
							}
						]}
					/>
				</ContentWrapper>
			</div>}
		</>
	);
};

export default Transactions;