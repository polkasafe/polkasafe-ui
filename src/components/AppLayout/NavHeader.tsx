// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { MenuOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';
import AddressDropdown from 'src/components/AddressDropdown';
import DonateBtn from 'src/components/Donate/DonateBtn';
import NetworksDropdown from 'src/components/NetworksDropdown';
import Notification from 'src/components/Notification';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';

const { Header } = Layout;

interface Props {
	className?: string
	sideDrawer: boolean
	setSideDrawer: React.Dispatch<React.SetStateAction<boolean>>
}

const NavHeader: FC<Props> = ({ sideDrawer, setSideDrawer }) => {
	const location = useLocation();
	const { address } = useGlobalUserDetailsContext();
	return (
		<Header className='bg-bg-main flex flex-row items-center p-0 h-[70px]'>
			<section className='hidden lg:block w-[240px]'></section>
			<section className='pr-4 lg:pr-8 pl-0 flex-1 flex items-center gap-x-2'>
				<article className='lg:hidden'>
					<button className='flex items-center justify-center outline-none border-none bg-bg-secondary text-primary rounded-xl px-[18px] py-[12px] md:px-[20px] md:py-[14px] font-bold text-xl md:text-2xl' onClick={() => {
						setSideDrawer(!sideDrawer);
					}}>
						<MenuOutlined />
					</button>
				</article>
				<article className='hidden sm:block'>
					<p className='bg-bg-secondary text-primary rounded-xl px-[14px] py-[4px] md:px-[16px] md:py-[6px] font-bold text-xl capitalize'>
						{location.pathname === '/' ? 'Home' :
							location.pathname.slice(1).split('-').join(' ')}
					</p>
				</article>
				<article className='ml-auto flex items-center gap-x-3'>
					{address && <Notification />}
					<NetworksDropdown />
					<AddressDropdown/>
					<DonateBtn />
				</article>
			</section>
		</Header>
	);
};

export default NavHeader;