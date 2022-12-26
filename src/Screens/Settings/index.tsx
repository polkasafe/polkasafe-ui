// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import profileImg from 'src/assets/icons/profile-img.png';
import Details from 'src/components/Settings/Details';
import Feedback from 'src/components/Settings/Feedback';
import AddNewOwnerBtn from 'src/components/Settings/Owners/AddBtn';
import ListOwners, { IOwner } from 'src/components/Settings/Owners/List';
import SearchOwner from 'src/components/Settings/Owners/Search';

const Settings = () => {
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

	return (
		<div>
			<h2 className='font-bold text-xl leading-[22px] text-white mb-4'>Manage Safe Owners</h2>
			<div className='bg-bg-main p-5 rounded-xl'>
				<section className='flex items-center justify-between flex-col gap-5 md:flex-row'>
					<SearchOwner />
					<AddNewOwnerBtn />
				</section>
				<section className='mt-[30px]'>
					<ListOwners owners={ owners } />
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