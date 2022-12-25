// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { AddIcon } from 'src/ui-components/CustomIcons';

const AddNewOwnerBtn = () => {
	return (
		<button className='text-white text-xs md:text-sm font-medium bg-primary py-2 px-3 md:p-3 rounded-md md:rounded-lg flex items-center gap-x-3'>
			<AddIcon />
			<span>Add New Owner</span>
		</button>
	);
};

export default AddNewOwnerBtn;