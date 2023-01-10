// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import CancelBtn from 'src/components/Settings/CancelBtn';
import AddBtn from 'src/components/Settings/ModalBtn';
import { useModalContext } from 'src/context/ModalContext';

const ExportAdress = () => {
	const { toggleVisibility } = useModalContext();
	return (
		<div className='flex flex-col w-[560px]'>
			<div className="flex items-left justify-left">
				<p className='mr-2 text-white'>You are about to export a CSV file with</p>
				<div className='bg-highlight text-primary px-2 rounded-md'>2 address book entries</div>
			</div>
			<div className='flex items-center justify-between gap-x-5 mt-[30px]'>
				<CancelBtn onClick={toggleVisibility}/>
				<AddBtn title='Export' />
			</div>
		</div>
	);
};

export default ExportAdress;