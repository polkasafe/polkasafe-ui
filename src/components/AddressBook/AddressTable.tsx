// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Badge, Dropdown, Modal, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { FC, useState } from 'react';
import { useActiveMultisigContext } from 'src/context/ActiveMultisigContext';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { IAllAddresses } from 'src/types';
import { AddIcon, CopyIcon, DeleteIcon, EditIcon, ExternalLinkIcon, OutlineCloseIcon, SharedIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import copyText from 'src/utils/copyText';
import getEncodedAddress from 'src/utils/getEncodedAddress';
import shortenAddress from 'src/utils/shortenAddress';
import styled from 'styled-components';

import SendFundsForm from '../SendFunds/SendFundsForm';
import EditAddress from './Edit';
import RemoveAddress from './Remove';

export interface IAddress {
	name: string;
	address: string;
}
interface IAddressProps {
    addresses: IAllAddresses
	setTab: React.Dispatch<React.SetStateAction<ETab>>
	tab: ETab;
	className?: string
}

enum ETab {
	SHARED,
	PERSONAL
}

const TransactionModal = ({ className, defaultAddress }: { className?: string, defaultAddress: string }) => {
	const [openTransactionModal, setOpenTransactionModal] = useState<boolean>(false);
	const { activeMultisig } = useGlobalUserDetailsContext();
	return (
		<>
			<PrimaryButton disabled={!activeMultisig} className='bg-primary text-white w-fit' onClick={() => setOpenTransactionModal(true)}>
				<p className='font-normal text-sm'>Send</p>
			</PrimaryButton>
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenTransactionModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Send Funds</h3>}
				open={openTransactionModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<SendFundsForm defaultSelectedAddress={defaultAddress} onCancel={() => setOpenTransactionModal(false)} />
			</Modal>
		</>
	);
};

const EditAddressModal = ({ className, addressToEdit, nameToEdit, nickNameToEdit, discordToEdit, emailToEdit, telegramToEdit, rolesToEdit, shared, personalToShared }: { personalToShared?: boolean, onlyName?: boolean, shared: boolean, className?: string, addressToEdit: string, nameToEdit?: string, nickNameToEdit?: string, discordToEdit?: string, emailToEdit?: string, telegramToEdit?: string, rolesToEdit?: string[] }) => {
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	return (
		<>
			{personalToShared ?
				<Tooltip title={'Add To Shared Address Book'}>
					<button onClick={() => setOpenEditModal(true)}>
						<AddIcon className='text-primary'/>
					</button>
				</Tooltip>
				:
				<button
					onClick={() => setOpenEditModal(true)}
					className={'text-primary bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'}>
					<EditIcon />
				</button>
			}
			<Modal
				centered
				footer={false}
				closeIcon={
					<button
						className='outline-none border-none bg-highlight w-6 h-6 rounded-full flex items-center justify-center'
						onClick={() => setOpenEditModal(false)}
					>
						<OutlineCloseIcon className='text-primary w-2 h-2' />
					</button>}
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>{ personalToShared ? 'Add to Shared Address Book' : 'Edit Address'}</h3>}
				open={openEditModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<EditAddress
					onCancel={() => setOpenEditModal(false)}
					className={className}
					addressToEdit={addressToEdit}
					nameToEdit={nameToEdit}
					nickNameToEdit={nickNameToEdit}
					discordToEdit={discordToEdit}
					emailToEdit={emailToEdit}
					rolesToEdit={rolesToEdit}
					telegramToEdit={telegramToEdit}
					shared={shared}
					personalToShared={personalToShared}
				/>
			</Modal>
		</>
	);
};

const AddressTable: FC<IAddressProps> = ({ addresses, className }) => {
	const { openModal } = useModalContext();
	const { network } = useGlobalApiContext();
	const { address: userAddress, multisigAddresses, activeMultisig } = useGlobalUserDetailsContext();
	const { records } = useActiveMultisigContext();

	const multisig = multisigAddresses.find(item => item.address === activeMultisig || item.address === activeMultisig);

	interface DataType {
		key: React.Key;
		name: React.ReactNode;
		address: React.ReactNode;
		email: React.ReactNode;
		discord: React.ReactNode;
		telegram: React.ReactNode;
		roles: React.ReactNode;
		actions: React.ReactNode
	}

	const columns: ColumnsType<DataType> = [
		{
			dataIndex: 'name',
			fixed: 'left',
			key: 'name',
			title: 'Name',
			width: 250
		},
		{
			dataIndex: 'address',
			fixed: 'left',
			key: 'address',
			title: 'Address',
			width: 250
		},
		{
			dataIndex: 'email',
			key: 'email',
			title: 'Email',
			width: 250
		},
		{
			dataIndex: 'discord',
			key: 'discord',
			title: 'Discord',
			width: 200
		},
		{
			dataIndex: 'telegram',
			key: 'telegram',
			title: 'Telegram',
			width: 200
		},
		{
			dataIndex: 'roles',
			key: 'roles',
			title: 'Roles',
			width: 300
		},
		{
			dataIndex: 'actions',
			fixed: 'right',
			key: 'actions',
			title: 'Actions',
			width: 200
		}
	];

	const addressBookData: DataType[] = Object.keys(addresses)?.map((address) => {
		const encodedAddress = getEncodedAddress(address, network) || address;
		return ({
			actions: <div className=' flex items-center justify-right gap-x-[10px]'>
				<EditAddressModal shared={!!addresses[address].shared} className={className} nickNameToEdit={addresses[address]?.nickName} addressToEdit={encodedAddress} nameToEdit={addresses[address]?.name} discordToEdit={addresses[address]?.discord} emailToEdit={addresses[address]?.email} rolesToEdit={addresses[address]?.roles} telegramToEdit={addresses[address]?.telegram} />
				{(encodedAddress !== userAddress && !multisig?.signatories.includes(encodedAddress)) &&
		<button
			onClick={() => openModal('Remove Address', <RemoveAddress shared={addresses[address].shared} addressToRemove={encodedAddress} name={addresses[address]?.name} />) }
			className='text-failure bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
			<DeleteIcon />
		</button>}
				<TransactionModal defaultAddress={encodedAddress} className={className} />
			</div>,
			address: <div className='flex items-center'>
				<Identicon
					className='image identicon mx-2'
					value={encodedAddress}
					size={30}
					theme={'polkadot'}
				/>
				<span title={encodedAddress} className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'>{shortenAddress(encodedAddress)}</span>
				<div className='ml-[14px] text-text_secondary text-base flex items-center gap-x-[6px]'>
					<button className='hover:text-primary' onClick={() => copyText(encodedAddress, true, network)}><CopyIcon /></button>
					<a href={`https://${network}.subscan.io/account/${encodedAddress}`} target='_blank' rel="noreferrer" >
						<ExternalLinkIcon  />
					</a>
				</div>
			</div>,
			discord: <div className='truncate'>{addresses[address]?.discord ? addresses[address].discord : '-'}</div>,
			email: <div className='truncate'>{addresses[address]?.email ? addresses[address].email : '-'}</div>,
			key: address,
			name: <p title={addresses[address]?.name || DEFAULT_ADDRESS_NAME} className='sm:w-auto h-[64px] overflow-hidden text-ellipsis flex items-center justify-between text-base'>
				<div className='h-full flex flex-col justify-center gap-y-1'>
					<div className='flex items-center truncate'>{addresses[address]?.name || DEFAULT_ADDRESS_NAME}
						{encodedAddress === userAddress && <Tooltip title={<span className='text-sm text-text_secondary'>Your Wallet Address</span>}><Badge className='ml-2' status='success' /></Tooltip>}
						{addresses[address].shared && <Tooltip className='ml-2' title={<span className='text-sm text-text_secondary'>Shared Address</span>}><SharedIcon className='text-primary' /></Tooltip>}
					</div>
					{addresses?.[address]?.nickName && <div className='text-sm'>({addresses?.[address]?.nickName})</div>}
				</div>
				{records && Object.keys(records)?.length > 0 && !Object.keys(records).includes(address) &&
				<EditAddressModal className={className} nickNameToEdit={addresses[address]?.nickName} addressToEdit={encodedAddress} nameToEdit={addresses[address]?.name} discordToEdit={addresses[address]?.discord} emailToEdit={addresses[address]?.email} rolesToEdit={addresses[address]?.roles} telegramToEdit={addresses[address]?.telegram} personalToShared shared={false} />
				}
			</p>,
			roles: <div className=' flex items-center gap-x-2'>{
				addresses[address] && addresses[address]?.roles && addresses[address].roles!.length > 0 ?
					<>
						{addresses[address].roles?.slice(0,2).map((role, i) => <span key={i} className='bg-primary bg-opacity-10 border border-solid border-primary text-primary rounded-lg py-1 px-3 max-w-[120px] truncate'>{role}</span>)}
						{addresses[address]?.roles!.length > 2 &&
					<Dropdown menu={{ items: addresses[address]?.roles?.slice(2).map((role, i) => ({
						key: i,
						label: <span key={i} className='bg-primary bg-opacity-10 border border-solid border-primary text-primary rounded-lg py-1 px-3'>{role}</span>
					})) }}>
						<span className='cursor-pointer py-1.5 px-3 rounded-full bg-primary'>+{addresses[address]?.roles!.length - 2}</span>
					</Dropdown>
						}
					</>
					: '-'
			}</div>,
			telegram: <div className='truncate'>{addresses[address]?.telegram ? addresses[address].telegram : '-'}</div>
		});
	});

	return (
		<>
			<div className='text-sm font-medium overflow-y-auto'>
				<Table columns={columns} pagination={false} dataSource={addressBookData} scroll={{ x: 1000, y: 400 }} />
			</div>
		</>
	);
};

export default styled(AddressTable)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;