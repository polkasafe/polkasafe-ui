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
import { DocsIcon } from 'src/ui-components/CustomIcons';

const { Header } = Layout;

interface Props {
	className?: string;
	sideDrawer: boolean;
	setSideDrawer: React.Dispatch<React.SetStateAction<boolean>>;
	showSubmenu?:boolean;
	onClick?: VoidFunction;

}

const NavHeader: FC<Props> = ({ sideDrawer, setSideDrawer, showSubmenu, onClick }) => {
	const location = useLocation();
	const { address } = useGlobalUserDetailsContext();
	return (
		<Header className='bg-bg-main z-10 flex flex-row items-center sticky top-0 left-0 p-0 h-[70px]'>
			<section className='hidden lg:block w-[180px]'></section>
			<section className='pr-4 lg:pr-8 pl-0 flex-1 flex items-center gap-x-2'>
				<article className='lg:hidden ml-4'>
					<button className='flex items-center justify-center outline-none border-none bg-bg-secondary text-primary rounded-lg px-[18px] py-[8px] font-bold text-xl' onClick={() => {
						setSideDrawer(!sideDrawer);
					}}>
						<MenuOutlined />
					</button>
				</article>
				<article className='hidden lg:block ml-4'>
					<p className='bg-bg-secondary text-primary rounded-xl px-[16px] py-[6px] font-bold text-xl capitalize'>
						{ showSubmenu && onClick ?
							<>
								<span onClick={onClick} className='hover:underline cursor-pointer'>
									{location.pathname === '/' ? 'Home' : location.pathname.slice(1).split('-').join(' ')}
								</span>
								{' '} / SubId
							</>
							:  location.pathname === '/' ? 'Home' : location.pathname.slice(1).split('-').join(' ')}
					</p>

				</article>
				<article className='ml-auto flex items-center gap-x-3'>
					{address && <Notification />}
					<NetworksDropdown />
					<AddressDropdown/>
					<DonateBtn />
					<a href='https://docs.polkasafe.xyz/' target='_blank' rel="noreferrer" className='flex items-center justify-center gap-x-2 outline-none border-none text-waiting bg-waiting bg-opacity-10 rounded-lg p-2.5 shadow-none text-xs' ><DocsIcon/> Docs</a>
				</article>
			</section>
		</Header>
	);
};

export default NavHeader;