// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import { Input } from 'antd';
import React, { useState } from 'react';
import profileImg from 'src/assets/icons/profile-img.png';
import AddAdress from 'src/components/AddressBook/AddAddress';
import AddressTable from 'src/components/AddressBook/AddressTable';
import { IAddress } from 'src/components/AddressBook/AddressTable';
import ExportAdress from 'src/components/AddressBook/ExportAddress';
import ImportAdress from 'src/components/AddressBook/ImportAddress';
import { useModalContext } from 'src/context/ModalContext';
import { SearchIcon } from 'src/ui-components/CustomIcons';
import { AddBoxIcon, ExportArrowIcon, ImportArrowIcon } from 'src/ui-components/CustomIcons';
const AddressBook = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const address: IAddress[] = [
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLp',
			imgSrc: profileImg,
			name: 'Jaski - 1'
		},
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWooo',
			imgSrc: profileImg,
			name: 'Mridul'
		},
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNou',
			imgSrc: profileImg,
			name: 'Param'
		}
	];
	const filteredData = address.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())||item.address.toLowerCase().includes(searchTerm.toLowerCase()));
	const { openModal } = useModalContext();
	return (
		<div className='h-[70vh] bg-bg-main rounded-lg'>
			<div className="grid grid-cols-12 gap-4">
				<div className="col-start-1 col-end-13">
					<div className="flex items-center justify-between">
						<div className='rounded-lg bg-bg-secondary flex items-center mt-5 mb-4 ml-5 p-1 text-xs gap-x-2 md:gap-x-4 md:text-sm'>
							<SearchIcon className='text-primary pl-3 pr-0' />
							<Input className= 'bg-bg-secondary placeholder-text_placeholder text-white outline-none border-none min-w-[300px]' placeholder='Search by name or address' value={searchTerm} onChange={e => setSearchTerm(e.target.value)}>
							</Input>
						</div>
						<div className='flex mr-3'>
							<Button className='flex items-center justify-center bg-highlight text-primary mr-2 mt-4 border-none' onClick={() => openModal('Import Address Book', <ImportAdress/>) }><ImportArrowIcon/>Import</Button>
							<Button className='flex items-center justify-center bg-highlight text-primary mr-2 mt-4 border-none' onClick={() => openModal('Export Address Book', <ExportAdress/>) }><ExportArrowIcon/>Export</Button>
							<Button className='flex items-center justify-center bg-primary text-white mr-2 mt-4 border-none' onClick={() => openModal('Add Address', <AddAdress/>)}><AddBoxIcon/> Add Address</Button>
						</div>
					</div>
				</div>
				<div className='col-start-1 col-end-13 relative mx-5'>
					<AddressTable address={ filteredData } />
				</div>
			</div>
		</div>
	);
};

export default AddressBook;