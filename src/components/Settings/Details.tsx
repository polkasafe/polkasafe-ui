// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { DeleteIcon, EditIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';

const Details = () => {
	return (
		<>
			<h2 className='font-bold text-xl leading-[22px] text-white mb-4'>
				Details
			</h2>
			<article className='bg-bg-main p-5 rounded-xl text-text_secondary text-sm font-normal leading-[15px]'>
				<div className='flex items-center justify-between gap-x-5'>
					<span>
						Contract Version:
					</span>
					<span className='bg-highlight text-primary flex items-center gap-x-3 rounded-lg px-2 py-[10px] font-medium'>
						1.3.0
						<ExternalLinkIcon className='text-primary' />
					</span>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-5'>
					<span>Blockchain:</span>
					<span className='text-white'>Polkadot</span>
				</div>
				<div className='flex items-center justify-between gap-x-5 mt-7'>
					<span>Safe Name:</span>
					<span className='text-white flex items-center gap-x-3'>
						New-Safe
						<EditIcon className='text-primary' />
					</span>
				</div>
				<button className='text-failure bg-failure bg-opacity-10 flex items-center gap-x-3 justify-center rounded-lg p-[10px] w-full mt-7'>
					<DeleteIcon />
					<span>Remove Safe</span>
				</button>
			</article>
		</>
	);
};

export default Details;