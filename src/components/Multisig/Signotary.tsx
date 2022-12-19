// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import dotIcon from 'src/assets/icons/polkadot.svg';

const Signotary = () => {
	return (
		<div className="flex w-[100%]">
			<div className='flex flex-col w-1/2'>
				<h1 className='mx-3 text-blue_primary'>Selected Signatories</h1>
				<div className='h-48 m-3 shadow-lg rounded-lg'>
					<div className="flex flex-col m-3">
						<div className='flex'>
							<img className='m-1 w-[20px] items-center' src={dotIcon} alt="icon" />
							<p className='m-1'>Main (Extension)</p>
						</div>
						<div className='flex'>
							<img className='m-1 w-[20px] items-center' src={dotIcon} alt="icon" />
							<p className='m-1'>Testnet-2 (Extension)</p>
						</div>
						<div className='flex'>
							<img className='m-1 w-[20px] items-center' src={dotIcon} alt="icon" />
							<p className='m-1'>Personal Test</p>
						</div>
					</div>
				</div>
			</div>
			<div className='flex flex-col w-1/2'>
				<h1 className='mx-3 text-blue_primary'>Available Signatories</h1>
				<div className='h-48 m-3 shadow-lg rounded-lg'></div>
			</div>
		</div>
	);
};

export default Signotary;