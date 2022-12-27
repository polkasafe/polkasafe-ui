// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DownCircleOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Space } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';

// const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
// message.info('Click on left button.');
// console.log('click left button', e);
// };

const DropdownLabel: React.FC<ILabelProps> = ({ label }) => (
	<span className='text-white hover:text-primary'>
		{label}
	</span>
);

const items: MenuProps['items'] = [
	{
		key: '1',
		label:(<DropdownLabel label={'USD'}/>)
	},
	{
		key: '2',
		label:(<DropdownLabel label={'Kusama'}/>)
	}
];

interface IAssetsTableProps {
	className?: string
}
interface ILabelProps {
	label?: string
}

const DropDown: React.FC<IAssetsTableProps> = ({ className })  => {
	const [currencyValue, setCurrencyValue] = useState<String | null>('USD');
	const handleMenuClick: MenuProps['onClick'] = (e) => {
		setCurrencyValue(e.domEvent.currentTarget.textContent);
	};
	const menuProps = {
		items,
		onClick: handleMenuClick
	};
	return(
		<Space wrap className={className}>
			<Dropdown menu={menuProps}>
				<Button className='bg-highlight text-primary border-none'>
					<Space>
						<p className='text-primary'>{ currencyValue }</p>
						<DownCircleOutlined />
					</Space>
				</Button>
			</Dropdown>
		</Space>
	);
};

export default styled(DropDown)`
	.ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item{
		background: red;
	}
`;

