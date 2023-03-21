// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import noTransactionsQueued from 'src/assets/icons/no-transactions-queued.svg';

const NoTransactionsQueued = () => {
	return (
		<div className='flex flex-col gap-y-10 items-center justify-center'>
			<img className='block w-[350px] h-[250px]' src={noTransactionsQueued} alt="Zero transaction icon" />
			<p className='font-normal text-sm leading-[15px] text-text_secondary'>No queued transactions</p>
		</div>
	);
};

export default NoTransactionsQueued;