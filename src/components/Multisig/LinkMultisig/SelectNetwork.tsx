// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import NetworksDropdown from 'src/components/NetworksDropdown';

import Loader from '../../UserFlow/Loader';

const SelectNetwork = () => {
	return (
		<div>
			<div className='flex flex-col items-center w-[800px] h-[400px]'>
				<div className="flex justify-around items-center w-full mb-10">
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-primary w-9 h-9 mb-2 flex items-center justify-center'>1</div>
						<p>Select Network</p>
					</div>
					<Loader className='bg-bg-secondary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>2</div>
						<p>Name & Address</p>
					</div>
					<Loader className='bg-bg-secondary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>3</div>
						<p>Owners</p>
					</div>
					<Loader className='bg-bg-secondary h-[2px] w-[80px]'/>
					<div className='flex flex-col text-white items-center justify-center'>
						<div className='rounded-lg bg-highlight text-primary w-9 h-9 mb-2 flex items-center justify-center'>4</div>
						<p>Review</p>
					</div>
				</div>
				<div>
					<p className='text-primary mt-10 w-[500px]'>Select a network on which the safe was created</p>
				</div>
				<div>
					<NetworksDropdown className='w-[500px] justify-between mt-3'/>
				</div>
			</div>
		</div>
	);
};

export default SelectNetwork;
