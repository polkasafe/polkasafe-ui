// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Divider, Dropdown, Space } from 'antd';
import React from 'react';

const items: MenuProps['items'] = [
	{
		key: '1',
		label: (
			<a target="_blank" rel="noopener noreferrer">
				Dot
			</a>
		)
	},
	{
		key: '2',
		label: (
			<a target="_blank" rel="noopener noreferrer">
				USD
			</a>
		)
		// disabled: true
	}
];

const DragDrop: React.FC = () => (
	<Dropdown
		menu={{ items }}
		dropdownRender={(menu) => (
			<div className="dropdown-content">
				{menu}
				<Divider style={{ margin: 0 }} />
				<Space style={{ padding: 8 }}>
					<Button type="primary">Click me!</Button>
				</Space>
			</div>
		)}
	>
		<a onClick={(e) => e.preventDefault()}>
			<Space>
				Select Currency
				<DownOutlined />
			</Space>
		</a>
	</Dropdown>
);

export default DragDrop;