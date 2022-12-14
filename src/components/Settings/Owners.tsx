// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React from 'react';

import Btn from './Btn';

const Owners = () => {
	const owners = [
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
			name: 'jaski'
		},
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
			name: 'kartik'
		},
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
			name: 'nikhil'
		}
	];
	return (
		<>
			<h3 className='text-lg lg:text-xl font-bold tracking-wide'>
                        Manage Safe Owners
			</h3>
			<p className='mt-3'>
                        Add, remove and replace owners or rename existing owners. Owner names are only stored locally and never shared with PolkaSafe or any third parties.
			</p>
			<div className='mt-10'>
				<article className='grid grid-cols-7 gap-x-3'>
					<span className='col-span-2 font-bold text-lg text-blue_primary'>Name</span>
					<span className='col-span-5 font-bold text-lg text-blue_primary'>Address</span>
				</article>
				<Divider/>
				{owners.map(({ name, address }, index) => {
					return <>
						<article key={index} className='grid grid-cols-7 items-center gap-x-3'>
							<span className='col-span-2 font-semibold text-lg text-black'>{name}</span>
							<p className='col-span-5 flex'>
								<span className='font-bold lg:text-base'>dot:</span>
								<span className='ml-1 w-[100px] md:w-auto flex-1 overflow-hidden text-ellipsis'>{address}</span>
							</p>
						</article>
						<Divider/>
					</>;
				})}
				<div className='flex items-center justify-center md:justify-end'>
					<Btn title='Add New Owner' />
				</div>
			</div>
		</>
	);
};

export default Owners;