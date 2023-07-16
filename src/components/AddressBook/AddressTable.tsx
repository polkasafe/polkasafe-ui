// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Badge, Dropdown, Modal, Table, Tooltip } from 'antd';
// import getEncodedAddress from 'src/utils/getEncodedAddress';
import type { ColumnsType } from 'antd/es/table';
import React, { FC, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { IAddressBookItem } from 'src/types';
import { CopyIcon, DeleteIcon, EditIcon, ExternalLinkIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';
import PrimaryButton from 'src/ui-components/PrimaryButton';
import copyText from 'src/utils/copyText';
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
    address: IAddressBookItem[];
	className?: string
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

const EditAddressModal = ({ className, addressToEdit, nameToEdit, discordToEdit, emailToEdit, telegramToEdit, rolesToEdit }: { className?: string, addressToEdit: string, nameToEdit?: string, discordToEdit?: string, emailToEdit?: string, telegramToEdit?: string, rolesToEdit?: string[] }) => {
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	return (
		<>
			<button
				onClick={() => setOpenEditModal(true)}
				className='text-primary bg-highlight flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
				<EditIcon />
			</button>
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
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>Send Funds</h3>}
				open={openEditModal}
				className={`${className} w-auto md:min-w-[500px] scale-90`}
			>
				<EditAddress
					onCancel={() => setOpenEditModal(false)}
					className={className}
					addressToEdit={addressToEdit}
					nameToEdit={nameToEdit}
					discordToEdit={discordToEdit}
					emailToEdit={emailToEdit}
					rolesToEdit={rolesToEdit}
					telegramToEdit={telegramToEdit}
				/>
			</Modal>
		</>
	);
};

const AddAddress: FC<IAddressProps> = ({ address, className }) => {
	const { openModal } = useModalContext();
	const { network } = useGlobalApiContext();
	const { address: userAddress } = useGlobalUserDetailsContext();

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
			width: 200
		},
		{
			dataIndex: 'address',
			fixed: 'left',
			key: 'address',
			title: 'Address',
			width: 200
		},
		{
			dataIndex: 'email',
			key: 'email',
			title: 'Email',
			width: 200
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
			width: 200
		},
		{
			dataIndex: 'actions',
			fixed: 'right',
			key: 'actions',
			title: 'Actions',
			width: 150
		}
	];

	const data: DataType[] = address.map(({ address, name, discord, telegram, roles, email }, index) => ({
		actions: <div className=' flex items-center justify-right gap-x-[10px]'>
			<EditAddressModal className={className} addressToEdit={address} nameToEdit={name} discordToEdit={discord} emailToEdit={email} rolesToEdit={roles} telegramToEdit={telegram} />
			{index > 0 &&
		<button
			onClick={() => openModal('Remove Address', <RemoveAddress addressToRemove={address} name={name} />) }
			className='text-failure bg-failure bg-opacity-10 flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8'>
			<DeleteIcon />
		</button>}
			<TransactionModal defaultAddress={address} className={className} />
		</div>,
		address: <div className='flex items-center'>
			<Identicon
				className='image identicon mx-2'
				value={address}
				size={30}
				theme={'polkadot'}
			/>
			<span title={address} className='hidden sm:block ml-[6px] max-w-md text-ellipsis overflow-hidden'>{shortenAddress(address)}</span>
			<div className='ml-[14px] text-text_secondary text-base flex items-center gap-x-[6px]'>
				<button className='hover:text-primary' onClick={() => copyText(address, true, network)}><CopyIcon /></button>
				<a href={`https://${network}.subscan.io/account/${address}`} target='_blank' rel="noreferrer" >
					<ExternalLinkIcon  />
				</a>
			</div>
		</div>,
		discord: <div className='truncate'>{discord ? discord : '-'}</div>,
		email: <div className='truncate'>{email ? email : '-'}</div>,
		key: index,
		name: <p title={name} className='max-w-[100px] sm:w-auto overflow-hidden text-ellipsis flex items-center text-base'>
			{name} {address === userAddress && <Tooltip title={<span className='text-sm text-text_secondary'>Your Wallet Address</span>}><Badge className='ml-2' status='success' /></Tooltip>}
		</p>,
		roles: <div className=' flex items-center gap-x-2'>{
			roles ?
				<>
					{roles.slice(0,2).map((role, i) => <span key={i} className='bg-primary rounded-lg text-white py-1 px-3'>{role}</span>)}
					{roles.length > 2 &&
					<Dropdown menu={{ items: roles.slice(2).map((role, i) => ({
						key: i,
						label: <span key={i} className='bg-primary rounded-lg text-xs text-white py-1 px-3'>{role}</span>
					})) }}>
						<span className='cursor-pointer py-1.5 px-3 rounded-full bg-primary'>+{roles.length - 2}</span>
					</Dropdown>
					}
				</>
				: '-'
		}</div>,
		telegram: <div className='truncate'>{telegram ? telegram : '-'}</div>
	}));

	return (
		<div className='text-sm font-medium h-[60vh] overflow-y-auto'>
			<Table columns={columns} pagination={false} dataSource={data} scroll={{ x: 1550 }} />
		</div>
	);
};

export default styled(AddAddress)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}

	.ant-select-selector {
		border: none !important;
		padding: 8px 10px;
		box-shadow: none !important;
		background-color: #24272E !important;
	}

	.ant-select {
		height: 40px !important;
	}
	.ant-select-selection-search {
		inset: 0 !important;
	}
	.ant-select-selection-placeholder{
		color: #505050 !important;
		z-index: 100;
		display: flex !important;
		align-items: center !important;
	}

	.ant-select-multiple .ant-select-selection-item {
		border: none !important;
		background: #1573FE !important;
		border-radius: 5px !important;
		color: white !important;
		margin-inline-end: 10px !important;
	}
`;