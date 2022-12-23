// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { MenuOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import React, { FC } from 'react';
import Notification from 'src/components/Notification';

import { IRouteInfo } from '.';

const { Header } = Layout;

interface Props {
	className?: string
	sideDrawer: boolean
	setSideDrawer: React.Dispatch<React.SetStateAction<boolean>>
	selectedRoute: IRouteInfo;
}
const NavHeader: FC<Props> = ({ sideDrawer, selectedRoute, setSideDrawer }) => {
	return (
		<Header className='bg-bg-main flex flex-row items-center p-0 h-[90px]'>
			<section className='hidden lg:block w-[240px]'></section>
			<section className='px-4 lg:px-8 flex-1 flex items-center justify-between gap-x-2'>
				<article>
					<p className='bg-bg-secondary text-primary rounded-xl px-[20px] py-[10px] font-bold text-2xl'>{selectedRoute.title}</p>
				</article>
				<article className='lg:hidden'>
					<Button icon={<MenuOutlined />} className='flex items-center justify-center outline-none border-none text-blue_primary shadow-none text-lg' onClick={() => {
						setSideDrawer(!sideDrawer);
					}} />
				</article>
				<article className='hidden lg:block'/>
				<article>
					<Notification/>
				</article>
			</section>
		</Header>
	);
};

export default NavHeader;