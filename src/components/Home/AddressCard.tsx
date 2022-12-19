// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Link } from 'react-router-dom';
import user from 'src/assets/icons/addrUser.svg';
// import bookmark from 'src/assets/icons/bookmark.svg';
import PrimaryButton from 'src/ui-components/PrimaryButton';

const AddressCard = ({ className }: { className?: string }) => {
	return (
		<div>
			<h2 className="text-lg font-bold">Address Book</h2>
			<div className={`${className} flex flex-col justify-around items-center rounded-lg py-5 bg-white shadow-lg text-center h-72 mt-3`}>
				<div className='flex flex-col items-center justify-around h-72'>
					<div className='flex justify-items-center items-center'>
						<img className='px-1' src={user} alt="user" />
						<div className='px-1 text-sm truncate'>3J98t1WpnyiWrnqRhWNLy</div>
					</div>
					<div className='flex justify-items-center items-center'>
						<img className='px-1' src={user} alt="user" />
						<div className='px-1 text-sm truncate'>3J98t1WpnyiWrnqRhWNLy</div>
					</div>
					<div className='flex justify-items-center items-center'>
						<img className='px-1' src={user} alt="user" />
						<div className='px-1 text-sm truncate'>3J98t1WpnyiWrnqRhWNLy</div>
					</div>
				</div>
				<Link to='/address-book' className='w-[100%] mt-5'>
					<PrimaryButton className='w-[90%]' onClick={() => { }}>All Address</PrimaryButton>
				</Link>
				<Link to='/address-book' className='w-[100%] mt-5'>
					<PrimaryButton className='w-[90%]' onClick={() => { }}>+ Add Address</PrimaryButton>
				</Link>
				{/* TODO: Empty state */}
				{/* <img src={bookmark} alt="save" />
				<p className='w-[50%]'>You don't have any saved addresses in your address book.</p>
				<PrimaryButton className='w-[90%] mt-5' onClick={() => { }}>+ Add Address</PrimaryButton> */}
			</div>
		</div>
	);
};

export default AddressCard;