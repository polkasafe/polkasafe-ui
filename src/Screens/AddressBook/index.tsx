// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from 'antd';
import React from 'react';
import profileImg from 'src/assets/icons/profile-img.png';
import AddAdress from 'src/components/AddressBook/AddAddress';
import AddressTable from 'src/components/AddressBook/AddressTable';
import { IAddress } from 'src/components/AddressBook/AddressTable';
import ExportAdress from 'src/components/AddressBook/ExportAddress';
import ImportAdress from 'src/components/AddressBook/ImportAddress';
import SearchAddress from 'src/components/AddressBook/Search';
import { useModalContext } from 'src/context/ModalContext';
import { AddBoxIcon, ExportArrowIcon, ImportArrowIcon } from 'src/ui-components/CustomIcons';
// .filter(obj => obj.name.includes(search))
const AddressBook = () => {
	const address: IAddress[] = [
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
			imgSrc: profileImg,
			name: 'Jaski - 1'
		},
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
			imgSrc: profileImg,
			name: 'Mridul'
		},
		{
			address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
			imgSrc: profileImg,
			name: 'Param'
		}
	];
	const { openModal } = useModalContext();
	// const [search, setSearch] = useState<string>('');
	// const getSearchValue = (value: string) => {
	// setSearch(value);
	// };
	// console.log(search);
	return (
		<div className='h-[70vh] bg-bg-main rounded-lg'>
			<div className="grid grid-cols-12 gap-4">
				<div className="col-start-1 col-end-13">
					<div className="flex items-center justify-between">
						<SearchAddress/>
						<div className='flex mr-3'>
							<Button className='flex items-center justify-center bg-highlight text-primary mr-2 mt-4 border-none' onClick={() => openModal('Import Address Book', <ImportAdress/>) }><ImportArrowIcon/>Import</Button>
							<Button className='flex items-center justify-center bg-highlight text-primary mr-2 mt-4 border-none' onClick={() => openModal('Export Address Book', <ExportAdress/>) }><ExportArrowIcon/>Export</Button>
							<Button className='flex items-center justify-center bg-primary text-white mr-2 mt-4 border-none' onClick={() => openModal('Add Address', <AddAdress/>)}><AddBoxIcon/> Add Address</Button>
						</div>
					</div>
				</div>
				<div className='col-start-1 col-end-13 relative mx-5'>
					<AddressTable address={ address } />
				</div>
			</div>
		</div>
	);
};

export default AddressBook;