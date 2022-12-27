// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button,Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { ChainIcon, PolkadotIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

interface DataType {
	key: string;
	asset: any;
	balance: string;
	value: string;
}

const columns: ColumnsType<DataType> = [
	{
		dataIndex: 'asset',
		key: 'asset',
		render: (text) => <a>{text}</a>,
		title: 'Asset'
	},
	{
		dataIndex: 'balance',
		key: 'balance',
		title: 'Balance'
	},
	{
		dataIndex: 'value',
		key: 'value',
		title: 'Value'
	},
	{
		key: 'action',
		render: () => (
			<Space size="middle">
				<Button className='bg-primary text-white shadow-sm rounded-md border-none'>Sent</Button>
			</Space>),
		title: 'Status'
	}
];

const data: DataType[] = [
	{
		asset: <div><PolkadotIcon className='mr-1'/>Polkadot</div> ,
		balance: '36288 USDC',
		key: '1',
		value: '7383893'
	},
	{
		asset: <div><ChainIcon className='mr-1'/>Polkadot</div>,
		balance: '36288 USDC',
		key: '2',
		value: '383893'
	},
	{
		asset: <div><ChainIcon className='mr-1'/>Polkadot</div>,
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