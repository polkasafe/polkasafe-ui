// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import PrimaryButton from 'src/ui-components/PrimaryButton';

const TransactionsBtns = () => {
	return (
		<div className='flex items-center gap-x-5 justify-center mt-5'>
			<PrimaryButton
				size='large'
				className='bg-green_primary text-white px-7'
			>
				Review
			</PrimaryButton>
			<PrimaryButton
				size='large'
				className='bg-[rgba(200,41,41,0.38)] text-white px-7'
			>
				Cancel
			</PrimaryButton>
		</div>
	);
};

export default TransactionsBtns;