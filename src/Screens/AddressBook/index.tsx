// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal } from 'antd';
import { Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AddAdress from 'src/components/AddressBook/AddAddress';
import AddressTable from 'src/components/AddressBook/AddressTable';
import ExportAdress from 'src/components/AddressBook/ExportAddress';
import ImportAdress from 'src/components/AddressBook/ImportAddress';
import { useActiveMultisigContext } from 'src/context/ActiveMultisigContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { IAllAddresses } from 'src/types';
import { ExternalLinkIcon, OutlineCloseIcon, SearchIcon } from 'src/ui-components/CustomIcons';
import { AddBoxIcon, ExportArrowIcon, ImportArrowIcon } from 'src/ui-components/CustomIcons';
import getSubstrateAddress from 'src/utils/getSubstrateAddress';

enum ETab {
	SHARED,
	PERSONAL
}

const AddressBook = ({ className }: { className?: string }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const { addressBook } = useGlobalUserDetailsContext();
	const { records } = useActiveMultisigContext();
	const [tab, setTab] = useState<ETab>(ETab.SHARED);
	const [addresses, setAddresses] = useState<IAllAddresses>({} as any);

	useEffect(() => {
		setAddresses({});
		const allAddresses: IAllAddresses = {};
		if(records){
			Object.keys(records).forEach((address) => {
				allAddresses[address] = {
					address,
					discord: records[address].discord,
					email: records[address].email,
					name: records[address].name,
					nickName: '',
					roles: records[address].roles,
					shared: true,
					telegram: records[address].telegram
				};
			});
		}
		addressBook.forEach(item => {
			const substrateAddress = getSubstrateAddress(item.address) || item.address;
			if(Object.keys(allAddresses).includes(substrateAddress)){
				if(item.nickName) {
					allAddresses[substrateAddress].nickName = item.nickName;
				}
				if(!allAddresses[substrateAddress].name){
					allAddresses[substrateAddress].name = item.name;
				}
			}
			else {
				allAddresses[substrateAddress] = {
					address: substrateAddress,
					discord: item.discord,
					email: item.email,
					name: item.name,
					nickName: item.nickName,
					roles: item.roles,
					shared: false,
					telegram: item.telegram
				};
			}
		});

		Object.keys(allAddresses)?.filter(address => allAddresses[address]?.name.toLowerCase().includes(searchTerm.toLowerCase()) || allAddresses[address]?.nickName?.toLowerCase().includes(searchTerm.toLowerCase()) || allAddresses[address]?.address.toLowerCase().includes(searchTerm.toLowerCase()) || records[address]?.roles?.includes(searchTerm)).forEach((address) => {
			setAddresses((prev) => {
				return {
					...prev,
					[address]: {
						address: allAddresses[address]?.address,
						discord: allAddresses[address]?.discord,
						email: allAddresses[address]?.email,
						name: allAddresses[address]?.name,
						nickName: allAddresses[address]?.nickName,
						roles: allAddresses[address]?.roles,
						shared: allAddresses[address]?.shared,
						telegram: allAddresses[address]?.telegram
					}

				};
			});
		});

	}, [addressBook, records, searchTerm]);

	const [openAddAddressModal, setOpenAddAddressModal] = useState<boolean>(false);

	const AddAddressModal = ({ className }: { className?: string }) => {
		return (
			<>
				<Button className='flex items-center justify-center bg-primary text-white border-none' onClick={() => setOpenAddAddressModal(true)}><AddBoxIcon/> Add Address</Button>
				<Modal
					centered
					footer={false}
					closeIcon={
						<button
							className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
							onClick={() => setOpenAddAddressModal(false)}
						>
							<OutlineCloseIcon className='text-primary w-2 h-2' />
						</button>}
					title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Add Address</h3>}
					open={openAddAddressModal}
					className={`${className} w-auto md:min-w-[500px] scale-90`}
				>
					<AddAdress onCancel={() => setOpenAddAddressModal(false)} className={className} />
				</Modal>
			</>
		);
	};

	const { openModal } = useModalContext();
	const userAddress = localStorage.getItem('address');
	return (
		<div className='scale-[80%] w-[125%] h-[125%] p-5 origin-top-left bg-bg-main rounded-lg'>
			{userAddress ?
				<div>
					<div className="flex items-center justify-between">
						<div className='rounded-lg bg-bg-secondary flex items-center mb-4 p-1 text-xs gap-x-2 md:gap-x-4 md:text-sm'>
							<SearchIcon className='text-primary pl-3 pr-0' />
							<Input className= 'bg-bg-secondary placeholder-text_placeholder text-white outline-none border-none min-w-[300px]' placeholder='Search by name or address' value={searchTerm} onChange={e => setSearchTerm(e.target.value)}>
							</Input>
						</div>
						<div className='flex'>
							<Button className='flex items-center justify-center bg-highlight text-primary mr-2 border-none' onClick={() => openModal('Import Address Book', <ImportAdress/>) }><ImportArrowIcon/>Import</Button>
							<Button className='flex items-center justify-center bg-highlight text-primary mr-2 border-none' onClick={() => openModal('Export Address Book', <ExportAdress records={addresses} />) }><ExportArrowIcon/>Export</Button>
							<AddAddressModal className={className} />
						</div>
					</div>
					<div>
						<AddressTable addresses={addresses} setTab={setTab} tab={tab} />
					</div>
				</div>
				: <div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link to='/'><span>Please Login</span> <ExternalLinkIcon /></Link>
				</div>
			}
		</div>
	);
};

export default AddressBook;