// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import styled from 'styled-components';

interface DataType {
	key: string;
	asset: string;
	balance: string;
	value: string;
}

const columns: ColumnsType<DataType> = [
	{
		dataIndex: 'asset',
		key: 'asset',
		render: (text) => <a>{text}</a>,
		title: 'ASSET'
	},
	{
		dataIndex: 'balance',
		key: 'balance',
		title: 'BALANCE'
	},
	{
		dataIndex: 'value',
		key: 'value',
		title: 'VALUE'
	},
	{
		key: 'action',
		render: () => (
			<Space size="middle">
				<button>Sent</button>
			</Space>),
		title: 'Status'
	}
];

const data: DataType[] = [
	{
		asset: 'USD Coin',
		balance: '36288 USDC',
		key: '1',
		value: '7383893'
	},
	{
		asset: 'USD Coin',
		balance: '36288 USDC',
		key: '2',
		value: '383893'
	},
	{
		asset: 'Polkadot',
		balance: '36288 DOT',
		key: '3',
		value: '83893'
	}
];
interface IAssetsTableProps {
	className?: string
}

const AssetsTable: React.FC<IAssetsTableProps> = ({ className }) => <Table className={className} columns={columns} dataSource={data} />;

export default styled(AssetsTable)`
	.ant-table-tbody, .ant-table-thead, .ant-table-cell {
  		background-color: #ffffff !important; 
	}
`;