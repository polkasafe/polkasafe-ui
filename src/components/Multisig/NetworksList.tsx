// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Avatar, List } from 'antd';
import React from 'react';
import hydraIcon from 'src/assets/icons/hydra.svg';

const data = [
	{
		title: 'Polkadot'
	},
	{
		title: 'Kusama'
	}
];

const NetworksList: React.FC = () => (
	<div className='flex flex-col h-92 w-64 bg-white rounded-lg shadow-lg mx-5'>
		<h1 className='text-blue_primary font-bold mt-3 mx-3'>CONNECT NETWORK</h1>
		<List
			itemLayout="horizontal"
			dataSource={data}
			renderItem={(item) => (
				<List.Item className='hover:bg-slate-50 cursor-pointer'>
					<List.Item.Meta
						avatar={<Avatar src={hydraIcon} />}
						title={<a href="https://ant.design">{item.title}</a>}
					/>
				</List.Item>
			)}
		/>
	</div>
);

export default NetworksList;