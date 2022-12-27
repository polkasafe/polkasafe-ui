// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button,Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import userAvatarIcon from 'src/assets/icons/user-avatar.svg';
import EditAddress from 'src/components/AddressBook/EditAddress';
import RemoveAddress from 'src/components/AddressBook/RemoveAddress';
import { useModalContext } from 'src/context/ModalContext';
import { CopyIcon, PencilIcon, ShareIcon, TrashIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

interface DataType {
	key: string;
	name: any;
	address: string;
	action: string;
}

const data: DataType[] = [
	{
		action: '7383893',
		address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
		key: '1',
		name: 'Mridul'
	},
	{
		action: '7383893',
		address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
		key: '1',
		name: 'Jaski'
	},
	{
		action: '7383893',
		address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
		key: '1',
		name: 'Param'
	}
];
interface IAssetsTableProps {
	className?: string
}

const AddressTable: React.FC<IAssetsTableProps> = ({ className }) => {
	const columns: ColumnsType<DataType> = [
		{
			dataIndex: 'name',
			key: 'name',
			render: (text) => <a>{text}</a>,
			title: 'Name'
		},
		{
			key: 'address',
			render: () => (
				<Space size="middle">
					<div className='flex mx-1 items-center justify-center'>
						<img className='w-4 mr-2' src={userAvatarIcon} alt="userAvatarIcon" />
						<p className='mr-2'>3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy</p>
						<CopyIcon className='mr-0 ml-1 cursor-pointer text-white'/>
						<ShareIcon className='mr-0 ml-1 cursor-pointer text-white'/>
					</div>
				</Space>),
			title: 'Address'
		},
		{
			key: 'action',
			render: () => (
				<Space size="middle">
					<div className='bg-primary bg-opacity-10 rounded-lg p-2 mr-1 h-[32px] w-[32px] flex items-center justify-center cursor-pointer' onClick={() => openModal('Edit Address', <EditAddress />) }>
						<PencilIcon />
					</div>
					<div className='bg-failure bg-opacity-10 rounded-lg p-2 mr-1 h-[32px] w-[32px] flex items-center justify-center cursor-pointer' onClick={() => openModal('Delete Address', <RemoveAddress />) }>
						<TrashIcon />
					</div>
					<Button className='bg-primary text-white shadow-sm rounded-md border-none'>Sent</Button>
				</Space>),
			title: 'Action'
		}
	];
	const { openModal } = useModalContext();
	return(
		<Table className={className} columns={columns} dataSource={data} />
	);
};
export default styled(AddressTable)`
	.ant-table-thead .ant-table-cell {
  		background: #24272E !important; 
		color: grey;
	}
	.ant-table-tbody .ant-table-cell{
		background: transparent !important;
		color: #ffffff;
	}
	.anticon svg{
		fill: #1573FE;
	}
`;
