// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Input } from 'antd';
import React from 'react';
import { SearchIcon } from 'src/ui-components/CustomIcons';
//type

const SearchAddress = ({ value, onChange }: any) => {
	return (
		<div className='rounded-lg bg-bg-secondary flex items-center mt-4 ml-5 text-xs gap-x-2 md:gap-x-4 md:text-sm'>
			<SearchIcon className='text-primary pl-3 pr-0' />
			<Input className= 'placeholder-text_placeholder text-white outline-none border-none min-w-[300px]' placeholder='Search by name or address' value={value} onChange={(e) => onChange(e.target.value)}></Input>
		</div>
	);
};

export default SearchAddress;