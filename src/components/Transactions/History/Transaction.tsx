// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import profileImg from 'src/assets/icons/profile-img.png';
import { ArrowDownLeftIcon, ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon, CopyIcon, ExternalLinkIcon, PolkadotIcon } from 'src/ui-components/CustomIcons';

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
				<article
					className='p-4 rounded-lg bg-bg-main'
				>
					<p
						className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'
					>
						<span>
							Received
						</span>
						<span
							className='text-success'
						>
							{amount} {amountType}
						</span>
						<span>
							from:
						</span>
					</p>
					<div
						className='mt-3 flex items-center gap-x-4'
					>
						<img className='w-10 h-10 block' src={profileImg} alt="profile image" />
						<div
							className='flex flex-col gap-y-[6px]'
						>
							<p
								className='font-medium text-sm leading-[15px] text-white'
							>
								Akshit
							</p>
							<p
								className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
							>
								<span>
									3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy
								</span>
								<span
									className='flex items-center gap-x-2 text-sm'
								>
									<CopyIcon />
									<ExternalLinkIcon />
								</span>
							</p>
						</div>
					</div>
					<Divider className='bg-text_secondary my-5' />
					<div
						className='w-full max-w-[418px] flex items-center justify-between gap-x-5'
					>
						<span
							className='text-text_secondary font-normal text-sm leading-[15px]'
						>
							Txn Hash:
						</span>
						<p
							className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
						>
							<span
								className='text-white font-normal text-sm leading-[15px]'
							>
								0xfb92...ed36
							</span>
							<span
								className='flex items-center gap-x-2 text-sm'
							>
								<CopyIcon />
								<ExternalLinkIcon />
							</span>
						</p>
					</div>
					<div
						className='w-full max-w-[418px] flex items-center justify-between gap-x-5 mt-3'
					>
						<span
							className='text-text_secondary font-normal text-sm leading-[15px]'
						>
							Executed:
						</span>
						<p
							className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
						>
							<span
								className='text-white font-normal text-sm leading-[15px]'
							>
								{date}, {time}
							</span>
						</p>
					</div>
				</article>
			</div>
		</article>
	);
};

export default Transaction;