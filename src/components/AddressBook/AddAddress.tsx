// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Input } from 'antd';
import React from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { useModalContext } from 'src/context/ModalContext';

interface IMultisigProps {
	className?: string
}

const AddAddress: React.FC<IMultisigProps> = () => {
	const { toggleVisibility } = useModalContext();
	return (
		<div className='flex flex-col w-[560px]'>
			<div className='flex flex-col'>
				<p className='text-primary text-xs'>Name</p>
				<Input className= 'placeholder-text_placeholder text-white outline-none border-none min-w-[300px] mb-4 mt-2' placeholder='Give the address a name'></Input>
				<p className='text-primary text-xs'>Address</p>
				<Input className= 'placeholder-text_placeholder text-white outline-none border-none min-w-[300px] mt-2' placeholder='Unique Address'></Input>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={toggleVisibility}/>
				<AddBtn title='Export' />
			</div>
		</div>
	);
};

export default AddAddress;