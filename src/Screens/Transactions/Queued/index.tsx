// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import noQueuedTransaction from 'src/assets/icons/no-queued-transaction.svg';

interface IQueuedProps {
    transactionsQueued: any[];
}
const Queued: FC<IQueuedProps> = ({ transactionsQueued }) => {
	return (
		<>
			{transactionsQueued.length > 0? 'hi':<div className='flex flex-col gap-y-10 items-center justify-center min-h-[425px]'>
				<div className='max-w-[225px] mt-14'>
					<img className='block w-full' src={noQueuedTransaction} alt="no queued transaction icon" />
				</div>
				<p className='font-bold text-lg text-black mb-14'>No Queued transactions</p>
			</div>}
		</>
	);
};

export default Queued;