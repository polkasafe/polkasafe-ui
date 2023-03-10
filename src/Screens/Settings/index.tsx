// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input } from 'antd';
import React, { useState } from 'react';
import profileImg from 'src/assets/icons/profile-img.png';
import Details from 'src/components/Settings/Details';
import Feedback from 'src/components/Settings/Feedback';
import AddNewOwnerBtn from 'src/components/Settings/Owners/AddBtn';
import ListOwners, { IOwner } from 'src/components/Settings/Owners/List';
// import SearchOwner from 'src/components/Settings/Owners/Search';
import { SearchIcon } from 'src/ui-components/CustomIcons';

const Settings = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const owners: IOwner[] = [
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
			imgSrc: profileImg,
			name: 'Jaski - 1'
		},
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
			imgSrc: profileImg,
			name: 'Mridul'
		},
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
			imgSrc: profileImg,
			name: 'Param'
		}
	];
	const filteredData = owners.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())||item.address.toLowerCase().includes(searchTerm.toLowerCase()));

	return (
		<div>
			{/* TODO: Add coming soon */}
			<h2 className='font-bold text-xl leading-[22px] text-white mb-4'>Manage Safe Owners</h2>
			<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden'>
				<div className='absolute w-full h-full bg-bg-main opacity-80 top-0 left-0 z-50 flex justify-center items-center text-primary font-bold text-[28px]'>Coming Soon...</div>
				<section className='flex items-center justify-between flex-col gap-5 md:flex-row'>
					{/* <SearchOwner /> */}
					<div className='rounded-lg bg-bg-secondary flex items-center p-1 text-xs gap-x-2 md:gap-x-4 md:text-sm'>
						<SearchIcon className='text-primary pl-3 pr-0' />
						<Input className= 'bg-bg-secondary placeholder-text_placeholder text-white outline-none border-none min-w-[300px]' placeholder='Search by name or address' value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
					</div>
					<AddNewOwnerBtn />
				</section>
				<section className='mt-[30px]'>
					<ListOwners owners={ filteredData } />
				</section>
			</div>
			<div className='mt-[30px] grid md:grid-cols-2 gap-[30px]'>
				<section className='col-span-1'>
					<Details />
				</section>
				<section className='col-span-1'>
					<Feedback />
				</section>
			</div>
		</div>
	);
};

export default Settings;