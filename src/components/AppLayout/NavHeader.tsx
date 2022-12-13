// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { BellOutlined, MenuOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import React, { FC } from 'react';

const { Header } = Layout;

interface Props {
	className?: string
	sideDrawer: boolean
	setSideDrawer: React.Dispatch<React.SetStateAction<boolean>>
}
const NavHeader: FC<Props> = ({ sideDrawer, setSideDrawer }) => {
	return (
		<Header className='bg-purple_app_bg flex flex-row items-center p-0 h-[60px]'>
			<section className='hidden lg:block w-[200px]'></section>
			<section className='px-4 lg:px-8 flex-1 flex items-center justify-between gap-x-2'>
				<article className='lg:hidden'>
					<Button icon={<MenuOutlined />} className='flex items-center justify-center outline-none border-none text-blue_primary shadow-none text-lg' onClick={() => {
						setSideDrawer(!sideDrawer);
					}} />
				</article>
				<article className='hidden lg:block'/>
				<article>
					<Button icon={<BellOutlined />} className='flex items-center justify-center outline-none border-none text-blue_secondary shadow-none text-xl' />
				</article>
			</section>
		</Header>
	);
};

export default NavHeader;