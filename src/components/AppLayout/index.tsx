// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Drawer, Layout } from 'antd';
import React, { useState } from 'react';
import styled from 'styled-components';

import Footer from './Footer';
import Menu from './Menu';
import NavHeader from './NavHeader';
import SwitchRoutes from './SwitchRoutes';

const { Content, Sider } = Layout;

const AppLayout = ({ className } : { className?: string }) => {
	const [sideDrawer, setSideDrawer] = useState(false);
	return (
		<Layout className={className}>
			<NavHeader setSideDrawer={setSideDrawer} sideDrawer={sideDrawer} />
			<Layout hasSider>
				<Sider
					trigger={null}
					collapsible={false}
					collapsed={true}
					className={'hidden overflow-y-hidden sidebar bg-white lg:block top-0 bottom-0 left-0 h-screen fixed z-40 w-full max-w-[200px] sider-shadow'}
				>
					<Menu />
				</Sider>
				<Drawer
					placement='left'
					closable={false}
					onClose={() => setSideDrawer(false)}
					open={sideDrawer}
					getContainer={false}
					className='w-full max-w-[200px] p-0'
				>
					<Menu />
				</Drawer>
				<Layout className='min-h flex flex-row p-0'>
					<div className='hidden lg:block w-[200px]'></div>
					<Content className='bg-purple_app_bg pl-8 pr-8'>
						<SwitchRoutes/>
					</Content>
				</Layout>
			</Layout>
			<Footer/>
		</Layout>
	);
};

export default styled(AppLayout)`
	background: transparent !important;
	.min-h {
		min-height: calc(100vh - 120px);
	}
	.sider-shadow {
		box-shadow: -2px 4px 4px rgba(63, 102, 153, 0.5);
	}
	.ant-drawer-content-wrapper {
		max-width: 200px;
	}
	.ant-drawer-mask {

	}
	.ant-drawer-body {
		padding: 0;
		margin: 0;
	}
`;