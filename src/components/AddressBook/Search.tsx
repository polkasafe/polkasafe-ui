// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { SearchIcon } from 'src/ui-components/CustomIcons';

const SearchAddress = () => {
	return (
		<div className='p-3 rounded-lg bg-bg-secondary flex items-center mt-4 ml-5 text-xs gap-x-2 md:gap-x-4 md:text-sm'>
			<SearchIcon className='text-primary' />
			<input placeholder='Search by name or address' className='outline-none border-none min-w-[237px] bg-transparent flex items-center font-normal text-white' type="text" />
		</div>
	);
};

export default SearchAddress;