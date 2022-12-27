// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { SearchIcon } from 'src/ui-components/CustomIcons';

const SearchMultisig = () => {
	return (
		<div className='rounded-lg bg-bg-secondary flex items-center text-xs gap-x-2 md:gap-x-4 md:text-sm p-2 w-[45vw] my-1'>
			<SearchIcon className='text-primary' />
			<input placeholder='Search by name, address or account index' className='outline-none border-none w-full bg-transparent flex items-center font-normal text-white' type="text" />
		</div>
	);
};

export default SearchMultisig;