// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { DollarIcon } from 'src/ui-components/CustomIcons';

const DonateBtn = () => {
	return (
		<div className='relative'>
			<button onClick={() => {
			}} className='flex items-center justify-center gap-x-[11px] outline-none border-none text-white bg-highlight rounded-lg p-3 shadow-none text-sm'>
				<DollarIcon className='text-base text-primary'/>
				<span className='hidden md:inline-flex text-primary'>
                    Donate
				</span>
			</button>
		</div>
	);
};

export default DonateBtn;