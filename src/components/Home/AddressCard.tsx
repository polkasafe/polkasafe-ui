// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import AddAddrIcon from 'src/assets/icons/add-addr-icon.svg';
import userAvatarIcon from 'src/assets/icons/user-avatar.svg';
import AddAdress from 'src/components/AddressBook/AddAddress';
import { useModalContext } from 'src/context/ModalContext';
import PrimaryButton from 'src/ui-components/PrimaryButton';

const AddressCard = ({ className }: { className?: string }) => {
	const { openModal } = useModalContext();
	return (
		<div>
			<h2 className="text-lg font-bold text-white">Address Book</h2>
			<div className={`${className} bg-bg-main flex flex-col justify-around items-center rounded-lg py-5 shadow-lg text-center h-72 mt-3`}>
				<div className='flex flex-col items-center justify-around h-72 overflow-x-hidden w-[100%]'>
					<div className='flex justify-items-center items-center'>
						<img className='px-1 w-[30px]' src={userAvatarIcon} alt="user" />
						<div className='px-1 text-sm text-white truncate'>3J98t1WpnyiWrnqRhWNLy</div>
					</div>
					<hr className='bg-secondary h-[1px] w-[80%]' />
					<div className='flex justify-items-center items-center'>
						<img className='px-1 w-[30px]' src={userAvatarIcon} alt="user" />
						<div className='px-1 text-sm text-white truncate'>3J98t1WpnyiWrnqRhWNLy</div>
					</div>
					<hr className='bg-secondary h-[1px] w-[80%]' />
					<div className='flex justify-items-center items-center'>
						<img className='px-1 w-[30px]' src={userAvatarIcon} alt="user" />
						<div className='px-1 text-sm text-white truncate'>3J98t1WpnyiWrnqRhWNLy</div>
					</div>
					<hr className='bg-secondary h-[1px] w-[80%]' />
				</div>
				<div className='w-[90%] mt-5'>
					<PrimaryButton className='w-[100%] flex items-center justify-center bg-highlight py-5' onClick={() => openModal('Add Address', <AddAdress/>)}>
						<img className='group-hover:fill-white' src={AddAddrIcon} alt="add"/>
						<p className='px-2 text-primary'>Add Address</p>
					</PrimaryButton>
				</div>
				{/* TODO: Empty state */}
				{/* <img src={bookmark} alt="save" />
				<p className='w-[50%]'>You don't have any saved addresses in your address book.</p>
				<PrimaryButton className='w-[90%] mt-5' onClick={() => { }}>+ Add Address</PrimaryButton> */}
			</div>
		</div>
	);
};

export default AddressCard;