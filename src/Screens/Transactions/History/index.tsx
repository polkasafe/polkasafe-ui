// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from 'antd';
import React, { FC } from 'react';
import noTransaction from 'src/assets/icons/no-transaction.svg';

interface IHistoryProps {
    transactionsHistory: any[];
}

const History: FC<IHistoryProps> = ({ transactionsHistory }) => {
	return (
		<>
			{transactionsHistory.length > 0? 'hi':<div className='flex flex-col gap-y-10 items-center justify-center min-h-[425px]'>
				<div className='max-w-[225px] mt-14'>
					<img className='block w-full' src={noTransaction} alt="no transaction icon" />
				</div>
				<p className='font-bold text-lg text-black'>No transactions have been made yet.</p>
				<Button icon={<span className='text-lg font-medium'>+</span>} className='border-none outline-none mb-5 shadow-small bg-gray_primary1 text-blue_primary p-2 m-0 flex items-center gap-x-2 font-medium'>
                    Create Transaction
				</Button>
			</div>}
		</>
	);
};

export default History;