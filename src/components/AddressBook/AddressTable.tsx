// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { Badge, Button, Dropdown, Modal, Table, Tooltip } from 'antd';
// import getEncodedAddress from 'src/utils/getEncodedAddress';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useModalContext } from 'src/context/ModalContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { IAddressBookItem, ISharedAddressBookRecord } from 'src/types';
import { CopyIcon, DeleteIcon, EditIcon, ExternalLinkIcon, OutlineCloseIcon } from 'src/ui-components/CustomIcons';
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
    records: {
		[address: string]: ISharedAddressBookRecord
	};
	personalAddresses: IAddressBookItem[];
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

const EditAddressModal = ({ className, addressToEdit, nameToEdit, discordToEdit, emailToEdit, telegramToEdit, rolesToEdit, shared, onlyName }: { onlyName?: boolean, shared: boolean, className?: string, addressToEdit: string, nameToEdit?: string, discordToEdit?: string, emailToEdit?: string, telegramToEdit?: string, rolesToEdit?: string[] }) => {
	const [openEditModal, setOpenEditModal] = useState<boolean>(false);
	return (
		<>
			<button
				onClick={() => setOpenEditModal(true)}
				className={`text-primary ${!onlyName && 'bg-highlight'} flex items-center justify-center p-1 sm:p-2 rounded-md sm:rounded-lg text-xs sm:text-sm w-6 h-6 sm:w-8 sm:h-8`}>
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
				title={<h3 className='text-white mb-8 text-lg font-semibold md:font-bold md:text-xl'>{onlyName ? 'Edit Name' : 'Edit Address'}</h3>}
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
					shared={shared}
					onlyName={onlyName}
				/>
			</Modal>
		</>
	);
};

const AddressTable: FC<IAddressProps> = ({ records, personalAddresses, className, setTab, tab }) => {
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
			width: 250
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
			width: 250
		},
		{
			dataIndex: 'actions',
			fixed: 'right',
			key: 'actions',
			title: 'Actions',
			width: 200
		}
	];

	const sharedAddressBookData: DataType[] = Object.keys(records).map((address) => {
		const encodedAddress = getEncodedAddress(address, network) || address;
		const personal = personalAddresses.find((item) => item.address === encodedAddress);
		return ({
			actions: <div className=' flex items-center justify-right gap-x-[10px]'>
				<EditAddressModal shared={true} className={className} addressToEdit={encodedAddress} nameToEdit={records[address]?.name} discordToEdit={records[address]?.discord} emailToEdit={records[address]?.email} rolesToEdit={records[address]?.roles} telegramToEdit={records[address]?.telegram} />
				{encodedAddress !== userAddress &&
		<button
			onClick={() => openModal('Remove Address', <RemoveAddress shared addressToRemove={encodedAddress} name={records[address]?.name} />) }
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
			discord: <div className='truncate'>{records[address]?.discord ? records[address].discord : '-'}</div>,
			email: <div className='truncate'>{records[address]?.email ? records[address].email : '-'}</div>,
			key: address,
			name: <p title={personal?.name || records[address]?.name || DEFAULT_ADDRESS_NAME} className='sm:w-auto overflow-hidden text-ellipsis flex items-center justify-between text-base'>
				<div className='flex items-center truncate'>{personal?.name || records[address]?.name || DEFAULT_ADDRESS_NAME} {encodedAddress === userAddress && <Tooltip title={<span className='text-sm text-text_secondary'>Your Wallet Address</span>}><Badge className='ml-2' status='success' /></Tooltip>}</div>
				<EditAddressModal onlyName={true} shared={false} className={className} addressToEdit={encodedAddress} nameToEdit={personal?.name || records[address]?.name || DEFAULT_ADDRESS_NAME} discordToEdit={records[address]?.discord} emailToEdit={records[address]?.email} rolesToEdit={records[address]?.roles} telegramToEdit={records[address]?.telegram}  />
			</p>,
			roles: <div className=' flex items-center gap-x-2'>{
				records[address] && records[address]?.roles && records[address].roles!.length > 0 ?
					<>
						{records[address].roles?.slice(0,2).map((role, i) => <span key={i} className='bg-primary rounded-lg text-white py-1 px-3 max-w-[80px] truncate'>{role}</span>)}
						{records[address]?.roles!.length > 2 &&
					<Dropdown menu={{ items: records[address]?.roles?.slice(2).map((role, i) => ({
						key: i,
						label: <span key={i} className='bg-primary rounded-lg text-xs text-white py-1 px-3'>{role}</span>
					})) }}>
						<span className='cursor-pointer py-1.5 px-3 rounded-full bg-primary'>+{records[address]?.roles!.length - 2}</span>
					</Dropdown>
						}
					</>
					: '-'
			}</div>,
			telegram: <div className='truncate'>{records[address]?.telegram ? records[address].telegram : '-'}</div>
		});
	});

	const personalAddressBookData: DataType[] = personalAddresses.map(({ address, name, email, discord, telegram, roles }) => ({
		actions: <div className=' flex items-center justify-right gap-x-[10px]'>
			<EditAddressModal shared={false} className={className} addressToEdit={address} nameToEdit={name} discordToEdit={discord} emailToEdit={email} rolesToEdit={roles} telegramToEdit={telegram} />
			{address !== userAddress &&
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
		discord: <div className='truncate'>{discord || '-'}</div>,
		email: <div className='truncate'>{email || '-'}</div>,
		key: address,
		name: <p title={name} className='sm:w-auto overflow-hidden text-ellipsis flex items-center text-base'>
			{name} {address === userAddress && <Tooltip title={<span className='text-sm text-text_secondary'>Your Wallet Address</span>}><Badge className='ml-2' status='success' /></Tooltip>}
		</p>,
		roles: <div className=' flex items-center gap-x-2'>{
			roles && roles.length ?
				<>
					{roles?.slice(0,2).map((role, i) => <span key={i} className='bg-primary rounded-lg text-white py-1 px-3 max-w-[80px] truncate'>{role}</span>)}
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
		telegram: <div className='truncate'>{telegram || '-'}</div>
	}));

	return (
		<>
			<div
				className='flex items-center mb-4'
			>
				<Button
					onClick={() => setTab(ETab.SHARED)}
					size='large'
					className={classNames(
						' font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none',
						{
							'text-primary bg-highlight': tab === ETab.SHARED
						}
					)}
				>
					SHARED
				</Button>
				<Button
					onClick={() => setTab(ETab.PERSONAL)}
					size='large'
					className={classNames(
						'font-medium text-sm leading-[15px] w-[100px] text-white outline-none border-none',
						{
							'text-primary bg-highlight': tab === ETab.PERSONAL
						}
					)}
				>
					PERSONAL
				</Button>
			</div>
			<div className='text-sm font-medium overflow-y-auto'>
				{
					tab === ETab.SHARED ?
						<Table columns={columns} pagination={false} dataSource={sharedAddressBookData} scroll={{ x: 1000, y: 400 }} />
						:
						<Table columns={columns} pagination={false} dataSource={personalAddressBookData} scroll={{ x: 1000, y: 400 }} />
				}
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