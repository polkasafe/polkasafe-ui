// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import React, { useState } from 'react';
import AddAddrIcon from 'src/assets/icons/add-addr-icon.svg';
import userAvatarIcon from 'src/assets/icons/user-avatar.svg';
import CustomModal from 'src/ui-components/CustomModal';
import PrimaryButton from 'src/ui-components/PrimaryButton';

const AddressCard = ({ className }: { className?: string }) => {

	const [isModalOpen, setIsModalOpen] = useState(false);

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleOk = () => {
		setIsModalOpen(false);
	};

	const handleCancel = () => {
		setIsModalOpen(false);
	};
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
					<PrimaryButton className='w-[100%] flex items-center justify-center bg-highlight py-5' onClick={showModal}>
						<img className='group-hover:fill-white' src={AddAddrIcon} alt="add"/>
						<p className='px-2 text-primary'>Add Address</p>
					</PrimaryButton>
				</div>
				<CustomModal title="Add Address" isOpen={isModalOpen} handleOk={handleOk} handleCancel={handleCancel}>
					<div className='flex flex-col'>
						<p className='text-primary mx-3 text-xs'>Name</p>
						<input type="text" className='rounded-md py-2 px-2 mx-3 mb-4 mt-1 bg-bg-secondary text-white text-xs' placeholder='Give the address a name'/>
						<p className='text-primary mx-3 text-xs'>Address</p>
						<input type="text" className='rounded-md py-2 px-2 mx-3 mb-4 mt-1 bg-bg-secondary text-white text-xs' placeholder='Unique Address'/>
						<div className="flex items-center justify-between px-3 py-2">
							<Button className='flex items-center justify-center bg-failure bg-opacity-10 border-none text-failure' onClick={handleCancel}><CloseCircleOutlined />Cancel</Button>
							<Button className='flex items-center justify-center bg-primary text-white border-none'><CheckCircleOutlined/> Save</Button>
						</div>
					</div>
				</CustomModal>
				{/* TODO: Empty state */}
				{/* <img src={bookmark} alt="save" />
				<p className='w-[50%]'>You don't have any saved addresses in your address book.</p>
				<PrimaryButton className='w-[90%] mt-5' onClick={() => { }}>+ Add Address</PrimaryButton> */}
			</div>
		</div>
	);
};

export default AddressCard;