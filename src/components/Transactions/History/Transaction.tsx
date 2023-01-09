// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { ArrowDownLeftIcon, ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon,  PolkadotIcon } from 'src/ui-components/CustomIcons';

import { ITransaction } from '.';
import ReceivedInfo from './ReceivedInfo';
import SentInfo from './SentInfo';

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
							<span
								className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-red-500'
							>
								<ArrowUpRightIcon />
							</span>
							:
							<span
								className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-green-500'
							>
								<ArrowDownLeftIcon />
							</span>
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
					<span className='text-success'>
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
						<SentInfo
							amount={amount}
							amountType={amountType}
							date={date}
							time={time}
						/>
				}
			</div>
		</article>
	);
};

export default Transaction;