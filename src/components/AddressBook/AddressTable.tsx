// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { HeartOutlined } from '@ant-design/icons';
import { Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import styled from 'styled-components';

interface DataType {
	key: string;
	name: string;
	address: string;
}

const columns: ColumnsType<DataType> = [
	{
		dataIndex: 'name',
		key: 'name',
		render: (text) => <a>{text}</a>,
		title: 'Name'
	},
	{
		dataIndex: 'address',
		key: 'address',
		title: 'Address'
	},
	{
		key: 'action',
		render: () => (
			<Space size="middle">
				<HeartOutlined className='cursor-pointer' />
			</Space>
		),
		title: 'Action'
	}
];

const data: DataType[] = [
	{
		address: 'dot: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
		key: '1',
		name: 'jaski'
	},
	{
		address: 'dot: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
		key: '2',
		name: 'kartik'
	},
	{
		address: 'dot: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
		key: '3',
		name: 'nikhil'
	},
	{
		address: 'dot: 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
		key: '4',
		name: 'vulture.finance'
	}
];
interface IAssetsTableProps {
	className?: string
}

const AddressTable: React.FC<IAssetsTableProps> = ({ className }) => <Table className={className} columns={columns} dataSource={data} />;

export default styled(AddressTable)`
	.ant-table-tbody, .ant-table-thead, .ant-table-cell {
  		background-color: #ffffff !important; 
	}
`;