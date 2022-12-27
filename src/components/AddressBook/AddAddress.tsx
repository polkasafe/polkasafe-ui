// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';

const AddAdress = () => {
	return (
		<div className='flex flex-col'>
			<div className='flex flex-col'>
				<p className='text-primary text-xs'>Name</p>
				<input type="text" className='rounded-md py-2 px-2 mb-4 mt-1 bg-bg-secondary text-white text-xs' placeholder='Give the address a name'/>
				<p className='text-primary text-xs'>Address</p>
				<input type="text" className='rounded-md py-2 px-2 mb-4 mt-1 bg-bg-secondary text-white text-xs' placeholder='Unique Address'/>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn/>
				<AddBtn title='Export' />
			</div>
		</div>
	);
};

export default AddAdress;