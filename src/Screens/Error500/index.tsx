// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Error500Img from 'src/assets/icons/Error500.svg';

const Error500 = () => {
	return (
		<div className='h-[70vh] bg-bg-main rounded-lg m-auto flex items-center justify-center'>
			<div className='flex flex-col items-center justify-center'>
				<img src={Error500Img} alt="bg"/>
				<h1 className="text-2xl text-primary m-5 font-bold">Internal Server Error</h1>
				<p className='text-text_secondary text-sm mb-5'>Server Error 500. We are working on fixing the problem.</p>
				<p className='text-text_secondary text-sm mb-5'>Be back soon.</p>
			</div>
		</div>
	);
};

export default Error500;