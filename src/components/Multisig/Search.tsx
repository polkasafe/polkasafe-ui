// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Input } from 'antd';
import React from 'react';
import { SearchIcon } from 'src/ui-components/CustomIcons';

const SearchMultisig = ({ addAddress, setAddAddress }: { addAddress: string, setAddAddress: React.Dispatch<React.SetStateAction<string>>}) => {
	return (
		<div className='rounded-lg bg-bg-secondary flex items-center text-xs gap-x-2 md:gap-x-4 md:text-sm w-full'>
			<SearchIcon className='text-primary pl-3 pr-0' />
			<Input value={addAddress} onChange={(e) => setAddAddress(e.target.value)} className= 'bg-bg-secondary placeholder-text_placeholder text-white outline-none py-2 border-none min-w-[300px]' placeholder='Search by name, address or account index'></Input>
		</div>
	);
};

export default SearchMultisig;