// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ArrowDownOutlined, ArrowUpOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { CopyIcon } from 'src/ui-components/CustomIcons';

import { ITransaction } from '.';

const Transaction: FC<ITransaction> = ({ amount, amountType, no, status, time, type }) => {
	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	return (
		<article>
			<div onClick={() => {
				toggleTransactionVisible(!transactionInfoVisible);
			}} className={classNames('grid items-center grid-cols-10 w-full flex-1 hover:bg-gray_primary cursor-pointer rounded-md px-3 py-5 font-medium', {
				'bg-gray_primary': transactionInfoVisible
			})}>
				<span className='col-span-1'>{no}</span>
				<p className='col-span-2 flex items-center gap-x-1'>
					{type === 'Sent'?<ArrowUpOutlined className='text-red-500' />: <ArrowDownOutlined className='text-green-500' />}
					<span>{type}</span>
				</p>
				<p className='col-span-2'>{type === 'Sent'?'-': '+'}{amount} {amountType}</p>
				<span className='col-span-3'>{time}</span>
				<div className='col-span-2 flex items-center justify-end gap-x-2 '>
					<span className='text-green-600'>{status}</span>
					{transactionInfoVisible?<UpOutlined className='text-gray-400' />: <DownOutlined className='text-gray-400' />}
				</div>
			</div>
			{
				transactionInfoVisible? <div className='grid grid-cols-3'>
					<div className="col-span-2">
						<div className='border-b border-blue_primary p-4'>
							<p>Sent <span className='font-medium'>10, 000 USDC</span> to:</p>
							<p className='flex items-center gap-x-1'>
								<span className='font-semibold'>eth: </span>
								<span>3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy</span>
								<CopyIcon className='text-blue_secondary'/>
							</p>
						</div>
						<div className='border-b border-blue_primary p-4 flex flex-col gap-y-2'>
							<p className='grid grid-cols-6'>
								<span className='col-span-2 text-blue_secondary'>
                                    Transaction hash:
								</span>
								<span className='col-span-4 flex items-center gap-x-1'>
                                    3J98t1...qRhWNLy
									<CopyIcon className='text-blue_secondary'/>
								</span>
							</p>
							<p className='grid grid-cols-6'>
								<span className='col-span-2 text-blue_secondary'>
                                    SafeTxHash:
								</span>
								<span className='col-span-4 flex items-center gap-x-1'>
                                    3J98t1...qRhWNLy
									<CopyIcon className='text-blue_secondary'/>
								</span>
							</p>
							<p className='grid grid-cols-6'>
								<span className='col-span-2 text-blue_secondary'>
                                    Created:
								</span>
								<span className='col-span-4'>
                                    Aug 4, 2022 - 12:10:22 PM
								</span>
							</p>
							<p className='grid grid-cols-6'>
								<span className='col-span-2 text-blue_secondary'>
                                    Executed:
								</span>
								<span className='col-span-4'>
                                    Aug 10, 2022 - 12:43:22 PM
								</span>
							</p>
							<p className='underline text-green-600 font-medium cursor-pointer'>Advanced Details</p>
						</div>
					</div>
					<div className="col-span-1 border-l border-blue_primary border-b"></div>
				</div>: null
			}
		</article>
	);
};

export default Transaction;