// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import polkasafeLogo from 'src/assets/icons/polkasafe.svg';
import profileImg from 'src/assets/icons/profile-img.png';
import AddMultisig from 'src/components/Multisig/AddMultisig';
import { useModalContext } from 'src/context/ModalContext';
import { AddressBookIcon, AppsIcon, AssetsIcon, HomeIcon, SettingsIcon, TransactionIcon, UserPlusIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';

import { IRouteInfo } from '.';

const menuItems = [
	{
		icon: <HomeIcon />,
		key: '/',
		title: 'Home'
	},
	{
		icon: <AssetsIcon />,
		key: '/assets',
		title: 'Assets'
	},
	{
		icon: <TransactionIcon />,
		key: '/transactions',
		title: 'Transactions'
	},
	{
		icon: <AddressBookIcon />,
		key: '/address-book',
		title: 'Address Book'
	},
	{
		icon: <AppsIcon />,
		key: '/apps',
		title: 'Apps'
	},
	{
		icon: <SettingsIcon />,
		key: '/settings',
		title: 'Settings'
	}
];

interface Props {
	className?: string;
	selectedRoute: IRouteInfo;
	setSelectedRoute: React.Dispatch<React.SetStateAction<IRouteInfo>>;
}

const Menu: FC<Props> = ({ className, selectedRoute, setSelectedRoute }) => {
	const [selectedAddress, setSelectedAddress] = useState('');
	const addresses = [
		{
			address: 'Jaski - 1',
			imgSrc: profileImg
		},
		{
			address: 'Jaski - 2',
			imgSrc: profileImg
		},
		{
			address: 'Jaski - 3',
			imgSrc: profileImg
		}
	];
	const { openModal } = useModalContext();
	return (
		<div className={classNames(className, 'bg-bg-main flex flex-col h-full gap-y-11 py-[30px] px-5 overflow-auto [&::-webkit-scrollbar]:hidden')}>
			<section>
				<Link className='text-white flex items-center gap-x-2 overflow-hidden ml-3' to='/'>
					<img src={polkasafeLogo} alt="polkasafe logo" />
				</Link>
			</section>
			<section>
				<h2 className='uppercase text-text_secondary ml-3 text-xs font-primary'>
					Menu
				</h2>
				<ul className='flex flex-col py-2 text-white list-none'>
					{
						menuItems.map((item) => {
							return <li className='w-full' key={item.key}>
								<Link className={classNames('flex items-center gap-x-2 flex-1 rounded-lg p-3 font-medium text-base', {
									'bg-highlight text-primary': item.title === selectedRoute.title
								})} onClick={() => setSelectedRoute({
									pathName: item.key,
									title: item.title
								})} to={item.key} >
									{item.icon}
									{item.title}
								</Link>
							</li>;
						})
					}
				</ul>
			</section>
			<section>
				<h2 className='uppercase text-text_secondary ml-3 text-xs font-primary flex items-center justify-between'>
					<span>Multisigs</span>
					<span className='bg-highlight text-primary rounded-full flex items-center justify-center h-6 w-6 font-normal text-xs'>3</span>
				</h2>
				<div>
					<ul className='flex flex-col py-2 text-white list-none'>
						{addresses.map(({ address, imgSrc }) => {
							return <li className='w-full' key={address}>
								<button className={classNames('w-full flex items-center gap-x-2 flex-1 rounded-lg p-3 font-medium text-base', {
									'bg-highlight text-primary': address === selectedAddress
								})} onClick={() => setSelectedAddress(address)}>
									<Avatar className={classNames('bg-white border-none outline-none',{
										'bg-primary': address === selectedAddress
									})} src={imgSrc} size="small" icon={<UserOutlined className='text-highlight' />}  />
									{address}
								</button>
							</li>;
						})}
					</ul>
				</div>
			</section>
			<section className='mt-auto'>
				<button className='text-white bg-primary p-3 rounded-lg w-full flex items-center justify-center gap-x-2 cursor-pointer'
					onClick={() => openModal('', <AddMultisig isModalPopup = {true} />) }>
					<UserPlusIcon className='text-xl' />
					<span className='font-normal text-sm'>Add Multisig</span>
				</button>
			</section>
		</div>
	);
};

export default styled(Menu)``;
