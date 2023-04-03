// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccount } from '@polkadot/extension-inject/types';
import { Divider, Dropdown } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import Address from 'src/ui-components/Address';
import styled from 'styled-components';

import { CircleArrowDownIcon } from './CustomIcons';

interface IAddressDropdownProps {
	defaultAddress?: string;
	accounts: InjectedAccount[];
	className?: string;
	disabled?: boolean
	onAccountChange: (address: string) => void;
}

const AddressDropdown: FC<IAddressDropdownProps> = ({ defaultAddress, className, accounts, disabled, onAccountChange }) => {

	const [selectedAddress, setSelectedAddress] = useState('');
	useEffect(() => {
		if (defaultAddress) {
			setSelectedAddress(defaultAddress);
		}
	}, [defaultAddress]);

	const dropdownList: {[index: string]: string} = {};
	const addressItems: ItemType[] = [];

	accounts.forEach((account, index) => {
		if (index === accounts.length - 1) {
			addressItems.push({
				key: account.address,
				label: (
					<Address extensionName={account.name} className='text-white' address={account.address} />
				)
			});
		} else {
			addressItems.push({
				key: account.address,
				label: (
					<div>
						<Address extensionName={account.name} className='text-white' address={account.address} />
						<Divider className='bg-text_secondary my-0 mt-3' />
					</div>
				)
			});
		}

		if (account.address && account.name){
			dropdownList[account.address] = account.name;
		}
	});
	return (
		<Dropdown
			disabled={disabled}
			trigger={['click']}
			className={classNames(
				'border border-primary rounded-xl px-3 py-[13px] bg-bg-secondary cursor-pointer',
				className
			)}
			menu={{
				items: addressItems,
				onClick: (e) => {
					setSelectedAddress(e.key);
					onAccountChange(e.key);
				}
			}}
		>
			<div className="flex justify-between items-center ">
				<Address
					extensionName={dropdownList[selectedAddress]}
					address={selectedAddress}
				/>
				<CircleArrowDownIcon className='text-primary text-base' />
			</div>
		</Dropdown>
	);
};

export default styled(AddressDropdown)`
	.ant-dropdown-menu-root {
		background-color: red !important;
	}
`;
