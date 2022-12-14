// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import DonateInfo from 'src/components/Donate/DonateInfo';
import { TrashIcon } from 'src/ui-components/CustomIcons';

const Donate = () => {
	return (
		<div>
			<section className='flex items-center justify-between'>
				<h2 className='text-xl lg:text-3xl font-bold tracking-wide'>Donate</h2>
				<p className='flex items-center gap-x-0.5 text-red_primary'>
					<TrashIcon/>
					<span className='text-sm lg:text-base font-medium'>Remove Safe</span>
				</p>
			</section>
			<DonateInfo/>
		</div>
	);
};

export default Donate;