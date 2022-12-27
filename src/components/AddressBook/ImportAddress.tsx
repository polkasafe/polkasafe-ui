// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import DragDrop from 'src/components/AddressBook/DragDrop';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';

const ImportAdress = () => {
	return (
		<div className='flex flex-col'>
			<div className='bg-bg-secondary p-4 m-3 rounded-md'>
				<DragDrop/>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn />
				<AddBtn title='Import' />
			</div>
		</div>
	);
};

export default ImportAdress;