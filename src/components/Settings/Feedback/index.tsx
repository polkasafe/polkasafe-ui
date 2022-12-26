// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { useModalContext } from 'src/context/ModalContext';

import Review from './Review';

const emojis  = ['😍', '🙂', '😐', '🙁', '😢'];

const Feedback = () => {
	const { openModal } = useModalContext();
	return (
		<>
			<h2 className='font-bold text-xl leading-[22px] text-white mb-4'>
				Feedback
			</h2>
			<article className='bg-bg-main p-5 rounded-xl text-text_secondary text-sm font-normal leading-[15px]'>
				<div className='flex items-center gap-x-5 justify-between text-sm font-normal leading-[15px]'>
					<p className='text-white'>What do you think of PolkaSafe?</p>
					<button
						onClick={() => openModal('Write a review', <Review />) }
						className='text-primary font-medium'>
							Write a Review
					</button>
				</div>
				<div className='my-[34.5px] flex items-center justify-center gap-x-5'>
					{emojis.map((emoji) => {
						return <span key={emoji} className='p-[10px] text-[32px] flex items-center justify-center bg-bg-secondary rounded-lg leading-none w-[52px] h-[52px]'>
							{emoji}
						</span>;
					})}
				</div>
				<button className='bg-highlight text-primary p-[11px] rounded-lg w-full'>Share Feedback</button>
			</article>
		</>
	);
};

export default Feedback;