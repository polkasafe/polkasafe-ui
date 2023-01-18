// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ReloadOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import ReceivedInfo from 'src/components/Transactions/History/ReceivedInfo';
import SentInfo from 'src/components/Transactions/History/SentInfo';
// import QueuedInfo from 'src/components/Transactions/Queued/QueuedInfo';
import { ArrowDownLeftIcon, ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon,  PolkadotIcon } from 'src/ui-components/CustomIcons';

import QueuedInfo from '../Queued/QueuedInfo';
import { ITransaction } from '.';

interface ITransactionProps extends ITransaction {
	date: string;
}

const Transaction: FC<ITransactionProps> = ({ amount, amountType, date, status, time, type }) => {
	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	return (
		<article
			className='bg-bg-secondary rounded-lg p-3'
		>
			<div
				onClick={() => {
					toggleTransactionVisible(!transactionInfoVisible);
				}}
				className={classNames(
					'grid items-center grid-cols-9 cursor-pointer text-white font-normal text-sm leading-[15px]'
				)}
			>
				<p className='col-span-3 flex items-center gap-x-3'>
					{
						type === 'Sent'?
							<div>
								{status !== 'Success'?
									<span
										className='flex items-center justify-center w-9 h-9 bg-waiting bg-opacity-10 p-[10px] rounded-lg text-red-500'
									>
										<ReloadOutlined className='text-waiting'/>
									</span>:
									<span
										className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-red-500'
									>
										<ArrowUpRightIcon />
									</span>}
							</div>
							:
							<div>
								{status !== 'Success'?
									<span
										className='flex items-center justify-center w-9 h-9 bg-waiting bg-opacity-10 p-[10px] rounded-lg text-red-500'
									>
										<ReloadOutlined className='text-waiting'/>
									</span>:
									<span
										className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-green-500'
									>
										<ArrowDownLeftIcon />
									</span>}
							</div>

					}
					<span>
						{type}
					</span>
				</p>
				<p className='col-span-2 flex items-center gap-x-[6px]'>
					<PolkadotIcon className='text-base' />
					<span
						className={classNames(
							'font-normal text-xs leading-[13px] text-failure',
							{
								'text-success': type === 'Received'
							}
						)}
					>
						{type === 'Sent'? '-': '+'}{amount} {amountType}
					</span>
				</p>
				<p className='col-span-2'>
					{time}
				</p>
				<p className='col-span-2 flex items-center justify-end gap-x-4'>
					<span
						className={classNames(
							'',
							{
								'text-success': status === 'Success',
								'text-waiting': status === 'Pending'
							}
						)}
					>
						{status}
					</span>
					<span className='text-white text-sm'>
						{
							transactionInfoVisible?
								<CircleArrowUpIcon />:
								<CircleArrowDownIcon />
						}
					</span>
				</p>
			</div>
			<div className={classNames(
				'h-0 transition-all overflow-hidden',
				{
					'h-auto overflow-auto': transactionInfoVisible
				}
			)}>
				<Divider className='bg-text_secondary my-5' />
				{
					type === 'Received'?
						<ReceivedInfo
							amount={amount}
							amountType={amountType}
							date={date}
							time={time}
						/>
						:
						<div>
							{status === 'Pending'?
								<QueuedInfo
									amount={amount}
									amountType={amountType}
									date={date}
									time={time}
								/>:
								<SentInfo
									amount={amount}
									amountType={amountType}
									date={date}
									time={time}
								/>
							}
						</div>
				}
			</div>
		</article>
	);
};

export default Transaction;