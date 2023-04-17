// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Details from 'src/components/Settings/Details';
import Feedback from 'src/components/Settings/Feedback';
import AddNewOwnerBtn from 'src/components/Settings/Owners/AddBtn';
import ListOwners from 'src/components/Settings/Owners/List';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';

const Settings = () => {
	const userAddress = localStorage.getItem('address');
	const { isProxy } = useGlobalUserDetailsContext();

	return (
		<div>
			{/* TODO: Add coming soon */}
			<h2 className='font-bold text-xl leading-[22px] text-white mb-4'>Manage Safe Owners</h2>
			<div className='bg-bg-main p-5 rounded-xl relative overflow-hidden'>
				{!isProxy && <div className='absolute w-full h-full bg-bg-main opacity-80 top-0 left-0 z-30 flex justify-center items-center text-primary font-bold text-[28px]'>Please Add Proxy</div>}
				<section className='flex items-center justify-between flex-col gap-5 md:flex-row'>
					<div className='flex-1'></div>
					<AddNewOwnerBtn />
				</section>
				<section className='mt-[30px]'>
					<ListOwners />
				</section>
			</div>
			{userAddress &&
			<div className='mt-[30px] grid md:grid-cols-2 gap-[30px]'>
				<section className='col-span-1'>
					<Details />
				</section>
				<section className='col-span-1'>
					<Feedback />
				</section>
			</div>}
		</div>
	);
};

export default Settings;