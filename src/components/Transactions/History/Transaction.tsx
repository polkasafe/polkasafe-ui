// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Collapse, Divider } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { FC, useState } from 'react';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { IHistoryTransaction } from 'src/types';
import { ArrowDownLeftIcon, ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon,  PolkadotIcon } from 'src/ui-components/CustomIcons';

import ReceivedInfo from './ReceivedInfo';
import SentInfo from './SentInfo';

const Transaction: FC<IHistoryTransaction> = ({ amount_token, token, created_at, to, from }) => {
	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const { address } = useGlobalUserDetailsContext();
	const type: 'Sent' | 'Received' = address === from ? 'Sent' : 'Received';

	return (
		<Collapse
			className='bg-bg-secondary rounded-lg p-3'
			bordered={false}
		>
			<Collapse.Panel showArrow={false} key={1} header={
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
							{type === 'Sent'? '-': '+'}{amount_token} {token}
						</span>
					</p>
					{/* <p className='col-span-2'>
					{time}
				</p> */}
					<p className='col-span-2 flex items-center justify-end gap-x-4'>
						<span className='text-success'>
							Success
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
			}>

				<div
				// className={classNames(
				// 'h-0 transition-all overflow-hidden',
				// {
				// 'h-auto overflow-auto': transactionInfoVisible
				// }
				// )}
				>
					<Divider className='bg-text_secondary my-5' />
					{
						type === 'Received'?
							<ReceivedInfo
								amount={String(amount_token)}
								amountType={token}
								date={dayjs(created_at).toISOString()}
							/>
							:
							<SentInfo
								amount={String(amount_token)}
								amountType={token}
								date={dayjs(created_at).toISOString()}
								recipient={to}
							/>
					}
				</div>
			</Collapse.Panel>
		</Collapse>
	);
};

export default Transaction;